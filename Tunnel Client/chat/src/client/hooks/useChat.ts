import {
  useMemo, useState, Dispatch, SetStateAction,
} from 'react';
import dayjs from 'dayjs';
import { getRoomMessagesTimestamp } from '@/connectors/rooms';
import useLazyPagination, { UseLazyPaginationResult } from '@/hooks/useLazyPaginationTimestamp';
import { Message, useSocket, UseSocketResult } from '@/hooks/useSocket';
import { MessagesService } from '@/services/MessagesService';
import { useRoom, UseRoomResult } from '@/hooks/useRoom';

export interface IChatContext {
  room: UseRoomResult;
  socket: UseSocketResult;
  messages: UseLazyPaginationResult<Message> & { pageSize: number; };
  firstItemIndex: number;
  setFirstItemIndex: Dispatch<SetStateAction<number>>;
}

const PAGE_SIZE = 50;

const useChat = () => {
  const pageSize = PAGE_SIZE;
  const [firstItemIndex, setFirstItemIndex] = useState<number>(0);
  const room = useRoom();
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const lazyMessages = useLazyPagination<Message>({
    connector: async (props) => {
      const { timestamp = +dayjs() } = props || {};
      return getRoomMessagesTimestamp(timestamp, pageSize)
        .then(async (response) => ({
          ...response,
          list: await new MessagesService().setMessages(response?.messages).getMessagesDecrypted(room.getConnectPassword()),
        }))
        .then((result) => {
          if (!firstItemIndex) {
            setFirstItemIndex(Math.max(0, result?.total || 0));
          } else if (result.list.length) {
            setFirstItemIndex((firstItemIndex) => Math.max(0, firstItemIndex - result.list.length));
          }
          return result;
        });
    },
    key: 'messages',
  });
  const messages = useMemo(() => ({
    ...lazyMessages,
    data: [...lazyMessages.data, ...socketMessages]
      .sort((a, b) => new Date(a.updatedAt).valueOf() - new Date(b.updatedAt).valueOf()),
    pageSize: Math.abs(pageSize),
  }), [lazyMessages, socketMessages, pageSize]);
  const socket = useSocket({
    messages: messages.data, setMessages: setSocketMessages, room,
  });
  return {
    socket,
    room,
    messages,
    firstItemIndex,
    setFirstItemIndex,
  };
};

export default useChat;