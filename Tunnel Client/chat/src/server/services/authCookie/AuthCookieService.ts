import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, getCookies, deleteCookie } from 'cookies-next';
import { Cookies } from '../../../common/constants';

export class AuthCookieService {
  public static updateCookie(req: NextApiRequest, res: NextApiResponse, token: string): void {
    setCookie(Cookies.AUTH_TOKEN, token, {
      req,
      res,
      // httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 14 * 24 * 60 * 60, // 14 days
      sameSite: 'lax',
      path: '/',
    });
  }
  public static deleteCookie(req: NextApiRequest, res: NextApiResponse): void {
    deleteCookie(Cookies.AUTH_TOKEN, { req, res });
  }
  public static getCookie(req: NextApiRequest, res: NextApiResponse): string {
    const { [Cookies.AUTH_TOKEN]: token } = getCookies({ req, res });
    return token || '';
  }
}