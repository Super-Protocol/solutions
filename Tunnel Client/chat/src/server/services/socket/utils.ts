import { v4 as uuidv4 } from 'uuid';

export const generateUserName = () => {
  return `user:${uuidv4()}`;
};

export const isRoomName = (roomName: string) => {
  return /^room:.+$/.test(roomName);
};

export const getRoomName = (id: string) => `room:${id}`;

export const getRoomId = (roomName: string): string => {
  const res = /^room:(.+)$/.exec(roomName);
  return res ? res[1] : '';
};