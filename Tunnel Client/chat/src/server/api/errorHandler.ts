import type { NextApiResponse } from 'next';

export const errorHandler = (error: Error, res: NextApiResponse) => {
  if (typeof error === 'string') {
    return res.status(400).json({ error });
  }

  if (error?.message === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid Token' });
  }

  return res.status(500).json({ error: error?.message });
};