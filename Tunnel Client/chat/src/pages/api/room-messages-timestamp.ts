import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import logger from '../../server/services/logger';
import { db } from '../../server/services/db';
import { apiHandler } from '../../server/api/apiHandler';
import { MessageDb } from '../../common/services/MessagesService';
import { AuthCookieService } from '../../server/services/authCookie/AuthCookieService';
import { JWTService } from '../../server/services/jwt/JWTService';
import { getConfig } from '../../client/utils/config';

export interface ResponseData {
  messages: MessageDb[];
  total: number;
  hasNextPage: boolean;
  timestamp: number | null;
}

export interface Response {
  data?: ResponseData;
  error?: string;
}

const createRoomLogger = logger.child({ name: 'roomMessagesTimestamp' });

const config = getConfig();

enum Direction {
  up = 'up',
  down = 'down'
}

export const roomMessagesTimestamp = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) return res.status(400).json({ error: 'Bad request' });
  const { timestamp, count } = req.query;
  if (!timestamp) return res.status(400).json({ error: 'Timestamp required' });
  const pageCount = Number(count);
  if (Math.abs(pageCount) > config.MAX_PAGE_SIZE) {
    return res.status(400).json({ error: `Count must be less then ${config.MAX_PAGE_SIZE}` });
  }
  const direction = pageCount >= 0 ? Direction.up : Direction.down;
  const date = dayjs(Number(timestamp));
  if (!date.isValid()) res.status(400).json({ error: 'Timestamp is invalid' });
  const token = AuthCookieService.getCookie(req, res);
  const { connectPassword } = new JWTService().decode(token);
  if (!connectPassword) return res.status(400).json({ error: 'Connect password required' });
  try {
    const roomId = db.rooms.getRoomIdByConnectPassword(connectPassword);
    if (!roomId) return res.status(400).json({ error: 'Room not found' });
    if (!await db.rooms.isRoomExists(roomId)) return res.status(400).json({ error: 'Room not found' });
    const room = (await db.rooms.getRoomFromAllInstances(connectPassword));
    if (!room) return res.status(400).json({ error: 'Room not found' });
    const { messages } = room;
    const total = messages.length;
    const filteredMessages = messages
      .filter(({ updatedAt }) => (direction === Direction.up ? +dayjs(updatedAt) <= +date : +dayjs(updatedAt) >= +date))
      .sort(
        (a, b) => (
          direction === Direction.up
            ? (dayjs(a.updatedAt).isAfter(b.updatedAt) ? 1 : -1)
            : (dayjs(a.updatedAt).isAfter(b.updatedAt) ? -1 : 1)
        ),
      );
    const slicedMessages = filteredMessages.slice(-Math.abs(pageCount));
    const firstMessage = slicedMessages[0];
    const newTimestamp = firstMessage?.updatedAt
      && dayjs(firstMessage.updatedAt).isValid()
      && slicedMessages.length >= Math.abs(pageCount)
      ? +dayjs(firstMessage.updatedAt)
      : null;
    return res.status(200).json({
      data: {
        messages: slicedMessages,
        hasNextPage: !!newTimestamp,
        total,
        timestamp: newTimestamp,
      },
    });
  } catch (err) {
    createRoomLogger.error({ err }, 'Message fetch error');
    return res.status(500).json({ error: 'Message fetch error' });
  }
};

export default apiHandler(roomMessagesTimestamp);