import { JWTService } from '../services/jwt';
import { AuthCookieService } from '../services/authCookie';
import {
  isRelative, getQSFromObj, getPathFromUrl, deleteKeysFromObject,
} from '../../common/utils';
import logger from '../services/logger';
import { db } from '../services/db';

const roomAuthLogger = logger.child({ class: 'check room auth' });

export const getUnauthorizedParams = (resolvedUrl: string, query: object, params: object) => {
  const newQuery = getQSFromObj({
    ...deleteKeysFromObject(query, Object.keys(params || {})), // some url params saved in query =/
    redirect: resolvedUrl && isRelative(resolvedUrl)
      ? getPathFromUrl(resolvedUrl) // keep only the pathname in the redirect url
      : undefined,
  });
  return {
    redirect: {
      destination: `/${newQuery}`,
      permanent: false,
    },
  };
};

export const getRoomPasswordParams = () => {
  return {
    redirect: {
      destination: '/room-password',
      permanent: false,
    },
  };
};

export const checkRoomAuth = (getServerSideProps?: Function) => {
  return async (ctx: any) => {
    try {
      const token = AuthCookieService.getCookie(ctx?.req, ctx?.res);
      const { connectPassword, userName } = new JWTService().decode(token);
      new JWTService().setPrivateKey(connectPassword).verify(token);
      if (connectPassword) {
        await db.rooms.getRoomToken(connectPassword, userName);
      } else {
        return getRoomPasswordParams();
      }
    } catch (err) {
      roomAuthLogger.error({ err });
      return getRoomPasswordParams();
    }
    if (getServerSideProps) {
      return getServerSideProps(ctx);
    }
    return {
      props: {},
    };
  };
};