import { fetcher } from './api';

const responseParser = async (response: any) => {
  if (response.ok) {
    const { data, error } = await response.json();
    if (!data) {
      throw new Error(error || 'Fetch error');
    }
    return data;
  }
  throw new Error('Fetch error');
};

export const createRoom = (roomName: string, userName: string) => {
  return fetcher(
    '/api/new-room',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomName, userName }) },
  );
};

export const connectToRoom = (connectPassword: string, userName: string) => {
  return fetcher(
    '/api/connect-to-room',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectPassword, userName }),
    },
  );
};

export const leaveRoom = () => {
  return fetcher(
    '/api/leave-room',
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
};

export const deleteRoom = (deletePassword: string) => {
  return fetcher(
    '/api/delete-room',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletePassword }),
    },
  );
};

export const getRoomMessagesPages = async (pageNum: number, pageSize: number) => {
  return fetcher(
    `/api/room-messages-pages?${new URLSearchParams({ pageNum: `${pageNum}`, pageSize: `${pageSize}` })}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  ).then(responseParser);
};

export const getRoomMessagesTimestamp = async (timestamp: number, count: number) => {
  return fetcher(
    `/api/room-messages-timestamp?${new URLSearchParams({
      timestamp: `${timestamp}`,
      count: `${count}`,
    })}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  ).then(responseParser);
};
