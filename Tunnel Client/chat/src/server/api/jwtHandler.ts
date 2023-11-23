import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthCookieService } from '../services/authCookie';
import { JWTService } from '../services/jwt';

const whiteList = ['/api/connect-to-room', '/api/new-room'];

export const jwtHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (whiteList.includes(req.url as string)) return;
  try {
    const token = AuthCookieService.getCookie(req, res);
    const { connectPassword } = new JWTService().decode(token);
    new JWTService().setPrivateKey(connectPassword).verify(token);
  } catch (e) {
    throw new Error('UnauthorizedError');
  }
};