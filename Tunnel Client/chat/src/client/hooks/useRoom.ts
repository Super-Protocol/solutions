import {
  useMemo, useCallback,
} from 'react';
import { getAuthorizationToken } from '@/utils/utils';
import { connectToRoom as connectToRoomConnector } from '@/connectors/rooms';
import { parseJwt } from '../../common/utils';
import { Token } from '../../server/services/jwt/types';

export interface RoomInfo { connectPassword: string; roomName: string; userName: string; }
export interface UseRoomResult {
  getConnectPassword: () => string;
  connectToRoom: () => Promise<void>;
  getRoomInfo: () => RoomInfo;
  getAuthToken: () => string;
  getParsedAuthToken: () => Token | null,
  getIsExpiredToken: () => boolean;
}

export const useRoom = (): UseRoomResult => {
  const getAuthToken = useCallback(() => {
    return getAuthorizationToken();
  }, []);
  const getParsedAuthToken = useCallback(() => {
    return (parseJwt<Token>(getAuthToken()));
  }, [getAuthToken]);
  const getConnectPassword = useCallback(() => {
    return getParsedAuthToken()?.connectPassword || '';
  }, [getParsedAuthToken]);
  const getRoomInfo = useCallback(() => {
    const parsedToken = getParsedAuthToken();
    return {
      roomName: parsedToken?.roomName || '',
      connectPassword: parsedToken?.connectPassword || '',
      userName: parsedToken?.userName || '',
    };
  }, [getParsedAuthToken]);
  const connectToRoom = useCallback(async () => {
    const { userName, connectPassword } = getRoomInfo();
    await connectToRoomConnector(connectPassword, userName);
  }, [getRoomInfo]);
  const getIsExpiredToken = useCallback(() => {
    const token = getParsedAuthToken();
    if (!token) return true;
    const { connectPassword, exp } = token || {};
    if (!connectPassword) return true;
    const now = new Date().getTime();
    return !(exp && now <= exp * 1000);
  }, [getParsedAuthToken]);

  const data = useMemo(() => ({
    getConnectPassword,
    getRoomInfo,
    connectToRoom,
    getAuthToken,
    getParsedAuthToken,
    getIsExpiredToken,
  }), [getConnectPassword, connectToRoom, getRoomInfo, getAuthToken, getParsedAuthToken, getIsExpiredToken]);

  return data;
};