import {
  useState, useEffect, useCallback, useRef, useMemo, Dispatch, SetStateAction,
} from 'react';
import { v1 as uuid } from 'uuid';
import { useRouter } from 'next/router';
import SocketIO, { Socket } from 'socket.io-client';
import { MessagesService } from '@/services/MessagesService';
import { UsersService } from '@/services/UsersService';
import { leaveRoom as leaveRoomConnector } from '@/connectors/rooms';
import { usePrevious } from '@/hooks/usePrevious';
import { UseRoomResult } from '@/hooks/useRoom';
import {
  MessageResponse, MessageDb,
} from '../../common/services/MessagesService';
import {
  UserResponse, UserDb,
} from '../../common/services/UsersService';
import { RoomStatus } from '../../common/types';

export interface RoomMembers {
  [id: string]: UserResponse;
}

export type Message = MessageResponse;

export interface UseSocketResult {
  roomMembers: RoomMembers;
  messages: Message[];
  joinRoom: () => void;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
  connected: boolean;
}

export interface UseSocketProps {
  room: UseRoomResult;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

export interface EncryptionMessage {
  encryption: string;
  messageClientId: string;
}

const REDIRECT_TIME = process.env.NEXT_PUBLIC_REDIRECT_TIME || '300000';

export const useSocket = ({
  messages, setMessages, room,
}: UseSocketProps): UseSocketResult => {
  const messaveServiceRef = useRef(new MessagesService());
  const usersServiceRef = useRef(new UsersService());
  const [connected, setConnected] = useState(false);
  const [canRedirect, setCanRedirect] = useState(false);
  const router = useRouter();
  const { push } = router;
  const { getRoomInfo, getAuthToken, getConnectPassword } = room;
  const socket = useRef<Socket | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMembers>({});
  const currentUserRef = useRef<UserResponse | null>(null);
  const socketSubscription = useRef<() => void>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConnected = usePrevious(connected);
  const messagesOfflineRef = useRef<EncryptionMessage[]>([]);
  const roomStatusRef = useRef<RoomStatus | null>(null);

  const joinRoom = useCallback(
    () => {
      const { userName } = getRoomInfo();
      if (socket.current) {
        socket.current.emit('joinRoom', userName);
      }
    },
    [getRoomInfo],
  );

  const resetRoom = useCallback(() => {
    setMessages([]);
    setRoomMembers({});
    currentUserRef.current = null;
  }, [setMessages]);

  const leaveRoom = useCallback(() => {
    if (socket.current) {
      socket.current.emit('leaveRoom');
      if (socket.current?.connected) {
        socket.current.disconnect();
      }
      resetRoom();
    }
  }, [resetRoom]);

  const sendMessage = useCallback(
    async (message: string) => {
      try {
        const createdAt = new Date().toISOString();
        const messageClientId = uuid();
        const { userName, connectPassword } = getRoomInfo();
        setMessages(
          (messages) => [
            ...messages, {
              messageClientId,
              senderName: userName,
              message,
              createdAt,
              updatedAt: createdAt,
              id: '',
              senderId: currentUserRef.current?.id || '',
            },
          ],
        );
        const messageEnc: EncryptionMessage = {
          encryption: JSON.stringify(await messaveServiceRef.current.encryptMessage(message, connectPassword)),
          messageClientId,
        };
        if (!connected || roomStatusRef.current !== RoomStatus.AVAILABLE || !socket.current?.connected) {
          messagesOfflineRef.current = [...messagesOfflineRef.current, messageEnc];
        } else {
          socket.current.emit(
            'message',
            messageEnc,
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [socket, getRoomInfo, connected, setMessages],
  );

  useEffect(() => {
    const subscription = () => {
      socket.current = SocketIO({
        query: { token: getAuthToken() },
        reconnectionDelay: 2000,
        transports: ['websocket'],
      });

      const _deleteRoom = async () => {
        if (socket.current?.connected) {
          socket.current.disconnect();
        }
        resetRoom();
        await leaveRoomConnector().catch((e) => {
          console.error(e);
        });
        push({ pathname: '/', query: { deleted: true } });
      };

      const _connectError = (e: Error) => {
        console.error(e);
        if (socket.current?.connected) {
          socket.current.disconnect();
        }
        if (canRedirect) {
          resetRoom();
          push('/');
        }
      };

      const _disconnect = (reason: string) => {
        setConnected(false);
        // the disconnection was initiated by the server, you need to reconnect manually
        if (reason === 'io server disconnect') {
          console.info('attempt to reconnect manually');
          socketSubscription.current?.();
          socketSubscription.current = subscription();
        } else {
          // else the socket will automatically try to reconnect
          console.info('attempt to auto reconnect');
        }
      };

      const _leaveRoom = (userIds: string[]) => {
        if (!Array.isArray(userIds) || !userIds.length) return;
        setRoomMembers((oldRoomMembers) => {
          const newRoomMembers = { ...oldRoomMembers };
          userIds.forEach((userId: string) => {
            delete newRoomMembers[userId];
          });
          return newRoomMembers;
        });
      };

      const _newUserJoinedToRoom = async (profile: UserDb) => {
        if (socket.current) {
          const newProfile = usersServiceRef.current
            .setUsers([profile])
            .getUserResponseById(profile.id);
          if (newProfile) {
            setRoomMembers((roomMembers) => ({ ...roomMembers, [newProfile.id]: newProfile }));
          }
        }
      };

      const _usersUpdatedInRoom = async (profiles: UserDb[]) => {
        if (socket.current) {
          const newProfiles = usersServiceRef.current
            .setUsers(profiles)
            .getUsersResponse();
          setRoomMembers(newProfiles.reduce((acc, user) => ({
            ...acc,
            [user.id]: user,
          }), {}));
        }
      };

      const _getRoomUsers = async (users: UserDb[]) => {
        const newUsers = usersServiceRef.current.setUsers(users).getUsersResponse();
        setRoomMembers(newUsers.reduce((acc, profile) => ({ ...acc, [profile.id]: profile }), {}));
      };

      const _updateMessagesFromSocket = async (messages: MessageDb[]) => {
        const messageDecrypted = await messaveServiceRef.current
          .setMessages(messages)
          .getMessagesDecrypted(getConnectPassword());
        if (messageDecrypted.length) {
          setMessages(
            (oldMessages) => {
              const messagesByClients = new Map<string, MessageResponse>(
                messageDecrypted.map((message) => [message.messageClientId, message]),
              );
              const updatedOldMessages = oldMessages.map((oldMessage) => {
                const messageFromServer = messagesByClients.get(oldMessage.messageClientId);
                if (messageFromServer) {
                  messagesByClients.delete(oldMessage.messageClientId);
                  return messageFromServer;
                }
                return oldMessage;
              });
              return [...updatedOldMessages, ...messagesByClients.values()]
                .sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());
            },
          );
        }
      };

      const _message = async (messageDb: MessageDb) => {
        if (messageDb) {
          await _updateMessagesFromSocket([messageDb]);
        }
      };

      const _messages = async (messagesDb: MessageDb[]) => {
        if (messagesDb?.length) {
          await _updateMessagesFromSocket(messagesDb);
        }
      };

      const _connect = async () => {
        setConnected(true);
      };

      const sendMessagesOffine = () => {
        if (messagesOfflineRef.current.length) {
          messagesOfflineRef.current.forEach((item) => {
            if (socket.current) {
              socket.current.emit(
                'message',
                item,
              );
            }
          });
          messagesOfflineRef.current = [];
        }
      };

      const _getRoomStatus = (status: RoomStatus) => {
        roomStatusRef.current = status;
        if (status === RoomStatus.AVAILABLE) {
          sendMessagesOffine();
        }
      };

      const _getCurrentUser = (user: UserDb) => {
        const newProfile = usersServiceRef.current
          .setUsers([user])
          .getUserResponseById(user.id);
        currentUserRef.current = newProfile;
      };

      socket.current.on('leaveRoom', _leaveRoom);
      socket.current.on('newUserJoinedToRoom', _newUserJoinedToRoom);
      socket.current.on('usersUpdatedInRoom', _usersUpdatedInRoom);
      socket.current.on('message', _message);
      socket.current.on('messages', _messages);
      socket.current.on('getRoomUsers', _getRoomUsers);
      socket.current.on('deleteRoom', _deleteRoom);
      socket.current.on('getRoomStatus', _getRoomStatus);
      socket.current.on('getCurrentUser', _getCurrentUser);

      socket.current.on('connect_error', _connectError);
      socket.current.on('disconnect', _disconnect);
      socket.current.on('connect', _connect);
      return () => {
        if (socket.current) {
          socket.current.off('leaveRoom', _leaveRoom);
          socket.current.off('newUserJoinedToRoom', _newUserJoinedToRoom);
          socket.current.off('usersUpdatedInRoom', _usersUpdatedInRoom);
          socket.current.off('getRoomUsers', _getRoomUsers);
          socket.current.off('message', _message);
          socket.current.off('messages', _messages);
          socket.current.off('deleteRoom', _deleteRoom);
          socket.current.off('getRoomStatus', _getRoomStatus);
          socket.current.off('getCurrentUser', _getCurrentUser);

          socket.current.off('connect_error', _connectError);
          socket.current.off('disconnect', _disconnect);
          socket.current.off('connect', _connect);
        }
      };
    };
    socketSubscription.current = subscription();
    return () => {
      socketSubscription.current?.();
      if (socket.current?.connected) {
        socket.current.disconnect();
      }
    };
  }, [getAuthToken, resetRoom, push, getConnectPassword, canRedirect, setMessages]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!connected && prevConnected) {
      timerRef.current = setTimeout(() => {
        setCanRedirect(true);
      }, Number(REDIRECT_TIME));
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [connected, prevConnected]);

  const data = useMemo(() => ({
    socket,
    joinRoom,
    leaveRoom,
    sendMessage,
    messages,
    roomMembers,
    connected,
  }), [socket, joinRoom, leaveRoom, sendMessage, messages, roomMembers, connected]);

  return data;
};