import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../server/services/logger';
import { db } from '../../server/services/db';
import { apiHandler } from '../../server/api/apiHandler';
import { MessageDb } from '../../common/services/MessagesService';
import { AuthCookieService } from '../../server/services/authCookie/AuthCookieService';
import { JWTService } from '../../server/services/jwt/JWTService';
import { getConfig } from '../../client/utils/config';

export interface ResponseData {
  messages: MessageDb[];
  hasNextPage: boolean;
  pageNum: number;
  total: number;
}

export interface Response {
  data?: ResponseData;
  error?: string;
}

const createRoomLogger = logger.child({ name: 'roomMessagesPages' });

const config = getConfig();

export const roomMessagesPages = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) return res.status(400).json({ error: 'Bad request' });
  const { pageNum, pageSize } = req.query;
  if (!pageNum) return res.status(400).json({ error: 'Page number required' });
  if (Number(pageSize) > config.MAX_PAGE_SIZE) {
    return res.status(400).json({ error: `Page size must be less then ${config.MAX_PAGE_SIZE}` });
  }
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
    const pageNumNumber = Number(pageNum);
    const pageSizeNumber = Number(pageSize) > 0 ? Number(pageSize) : config.PAGE_SIZE;
    const endIndex = total - (pageNumNumber - 1 > 0 ? pageNumNumber - 1 : 0) * pageSizeNumber;
    const startIndex = endIndex - pageSizeNumber;
    const slicedMessages = messages.slice(startIndex < 0 ? 0 : startIndex, endIndex < 0 ? 0 : endIndex);
    const hasNextPage = endIndex >= 0;
    return res.status(200).json({
      data: {
        messages: slicedMessages,
        hasNextPage,
        pageNum: pageNumNumber,
        total,
      },
    });
  } catch (err) {
    createRoomLogger.error({ err }, 'Message fetch error');
    return res.status(500).json({ error: 'Message fetch error' });
  }
};

export default apiHandler(roomMessagesPages);