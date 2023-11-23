import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../server/services/logger';
import { JWTService } from '../../server/services/jwt';
import { AuthCookieService } from '../../server/services/authCookie';
import { apiHandler } from '../../server/api/apiHandler';

export interface Response {
  error?: string;
  data?: string;
}

const leaveRoom = async (
  req: NextApiRequest,
  res: NextApiResponse<Response>,
) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = AuthCookieService.getCookie(req, res);
  if (!token) return res.status(401).json({ error: 'jwt token required' });
  let connectPassword;
  try {
    connectPassword = new JWTService().decode(token)?.connectPassword;
    new JWTService().setPrivateKey(connectPassword).verify(token);
  } catch (e) {
    return res.status(401).json({ error: 'Jwt token is invalid' });
  }
  if (!connectPassword) return res.status(401).json({ error: 'password required' });
  try {
    AuthCookieService.deleteCookie(req, res);
    return res.status(200).json({ data: 'ok' });
  } catch (err) {
    logger.error({ err }, 'error api leave-from-room');
    return res.status(500).json({ error: 'Leave room failed' });
  }
};

export default apiHandler(leaveRoom);