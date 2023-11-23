import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/services/db';
import logger from '../../server/services/logger';
import { JWTService } from '../../server/services/jwt';
import { getConfig } from '../../client/utils/config';
import { AuthCookieService } from '../../server/services/authCookie';

export interface Response {
  error?: string;
  data?: { roomName: string; userName: string; token: string; };
}

const connectToRoomLogger = logger.child({ name: 'connectToRoom' });

const config = getConfig();

const connectToRoom = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) return res.status(400).json({ error: 'Bad request' });
  const { connectPassword, userName } = req.body;
  if (!connectPassword) return res.status(400).json({ error: 'Password required' });
  if (!userName) return res.status(400).json({ error: 'Room name required' });
  if (userName.length > config.MAX_ROOM_NAME_SYMBOLS) {
    return res.status(400).json({ error: `User name must have max ${config.MAX_USER_NAME_SYMBOLS} symbols` });
  }
  try {
    await db.rooms.getRoomFromCurrentInstance(connectPassword);
  } catch (err) {
    return res.status(404).json({ error: 'This chat room does not exist' });
  }
  let token;
  let roomName;
  try {
    token = await db.rooms.getRoomToken(connectPassword, userName);
  } catch (err) {
    return res.status(401).json({ error: 'Password invalid' });
  }
  try {
    const parsed = new JWTService().setPrivateKey(connectPassword).verify(token);
    roomName = parsed.roomName;
  } catch (err) {
    return res.status(401).json({ error: 'Jwt token is invalid' });
  }
  if (!roomName) return res.status(400).json({ error: 'Room name is not defined' });
  try {
    AuthCookieService.updateCookie(req, res, token);
    return res.status(200).json({ data: { roomName, userName, token } });
  } catch (err) {
    connectToRoomLogger.error({ err }, 'error set cookie');
    return res.status(500).json({ error: 'Connect to the room failed' });
  }
};

export default connectToRoom;