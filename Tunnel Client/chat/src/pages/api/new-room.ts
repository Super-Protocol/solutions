import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../server/services/logger';
import { db } from '../../server/services/db';
import { getConfig } from '../../client/utils/config';
import { apiHandler } from '../../server/api/apiHandler';
import { HelperService } from '../../common/services/HelperService';

export interface ResponseData { deletePassword: string; connectPassword: string; roomName: string; }

export interface Response {
  data?: ResponseData;
  error?: string;
}

const createRoomLogger = logger.child({ name: 'createRoom' });

const config = getConfig();

export const createRoom = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) return res.status(400).json({ error: 'Bad request' });
  const { roomName, userName } = req.body;
  if (!roomName) return res.status(400).json({ error: 'Room required' });
  if (!userName) return res.status(400).json({ error: 'User required' });
  if (roomName.length > config.MAX_ROOM_NAME_SYMBOLS) {
    return res.status(400).json({ error: `Room name must have max ${config.MAX_ROOM_NAME_SYMBOLS} symbols` });
  }
  if (userName.length > config.MAX_USER_NAME_SYMBOLS) {
    return res.status(400).json({ error: `User name must have max ${config.MAX_USER_NAME_SYMBOLS} symbols` });
  }
  try {
    const {
      connectPassword, deletePassword, name,
    } = await db.rooms.createRoom(roomName);
    return res.status(200).json({
      data: {
        connectPassword, deletePassword, roomName: new HelperService().textFromBase64(name),
      },
    });
  } catch (err) {
    createRoomLogger.error({ err }, 'Room creation error');
    return res.status(500).json({ error: 'Room creation error' });
  }
};

export default apiHandler(createRoom);