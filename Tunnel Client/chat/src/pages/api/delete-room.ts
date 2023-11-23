import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/services/db';
import logger from '../../server/services/logger';
import { apiHandler } from '../../server/api/apiHandler';

export interface Response {
  error?: string;
  data?: string;
}

const deleteRoomLogger = logger.child({ name: 'deleteRoom' });

export const deleteRoom = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!req.body) return res.status(400).json({ error: 'Bad request' });
  const { deletePassword } = req.body;
  if (!deletePassword) return res.status(400).json({ error: 'Password required' });
  try {
    await db.rooms.deleteRoom(deletePassword);
  } catch (e) {
    return res.status(401).json({ error: 'Failed to delete room. Password invalid' });
  }
  try {
    deleteRoomLogger.info('Room successfully deleted');
    return res.status(200).json({ data: 'Room successfully deleted' });
  } catch (err) {
    deleteRoomLogger.error({ err });
    return res.status(500).json({ error: 'Failed to delete room' });
  }
};

export default apiHandler(deleteRoom);