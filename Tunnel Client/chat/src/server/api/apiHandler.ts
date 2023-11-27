import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtHandler } from './jwtHandler';
import { errorHandler } from './errorHandler';

export type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<any>

export const apiHandler = (handler: Handler) => {
  return async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {
      await jwtHandler(req, res);
      return handler(req, res);
    } catch (err) {
      return errorHandler(err as Error, res);
    }
  };
};