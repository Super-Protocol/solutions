import dynamic from 'next/dynamic';
import cn from 'classnames';
import {
  useEffect, useState, memo, useMemo, useCallback, useRef,
} from 'react';
import { VirtuosoHandle } from 'react-virtuoso';
import { useDebouncedCallback } from 'use-debounce';
import useChat from '@/hooks/useChat';
import { getDomainUrl } from '@/utils/utils';
import { Header } from '@/components/Header';
import { useMobile } from '@/contexts/MobileContext';
import { ChatMembersCount } from '@/components/ChatMembersCount';
import { MobileChatMembers } from '@/components/MobileChatMembers';
import { CopyInvationBlock } from '@/components/CopyInvationBlock';
import { ChatMembers } from './ChatMembers';
import { Info } from './Info';
import { Box } from '../../ui/Box';
import { getMembersList, SCROLL_BOTTOM_DISTANCE } from './helpers';
import classes from './Room.module.scss';

const Chat = dynamic(() => import('./Chat/Chat'), { ssr: false });

export const Room = memo(() => {
  const canScrollToBottomRef = useRef<boolean>(true);
  const triggerRef = useRef<VirtuosoHandle>(null);
  const scrollerRef = useRef<HTMLElement | Window | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const [isShowMobileMembersCount, setIsShowMembersCount] = useState(false);
  const { isMobile } = useMobile();
  const scrollToBottom = useCallback((index: number) => {
    triggerRef.current?.scrollToIndex(index);
  }, []);
  const scrollToBottomTimeout = useCallback((index: number, timeout = 1) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom(index);
    }, timeout);
  }, [scrollToBottom]);
  const {
    room, socket, messages, firstItemIndex,
  } = useChat();
  const {
    connected,
    joinRoom,
    roomMembers,
  } = socket;
  const messageData = useMemo(() => messages.data, [messages]);
  const { getRoomInfo, getAuthToken } = room;
  const list = useMemo(() => getMembersList(Object.values(roomMembers)), [roomMembers]);
  const onClickMembersCount = useCallback(() => {
    setIsShowMembersCount(true);
  }, []);
  const onClickCloseMobileMembers = useCallback(() => {
    setIsShowMembersCount(false);
  }, []);
  const roomInfo = useMemo(() => getRoomInfo(), [getRoomInfo]);
  const authToken = useMemo(() => getAuthToken(), [getAuthToken]);
  const scrollToLastMessage = useCallback(() => {
    if (messageData?.length) {
      scrollToBottomTimeout(messageData.length - 1);
    }
  }, [messageData, scrollToBottomTimeout]);
  const onSendMessage = useCallback((message: string) => {
    socket.sendMessage(message);
  }, [socket]);
  const scrollerRefCallback = useCallback((ref: HTMLElement | Window | null) => {
    scrollerRef.current = ref;
  }, []);
  const onChangeScrolling = useCallback(() => {
    if (!scrollerRef.current) return;
    const div = scrollerRef.current as HTMLElement;
    if (div.scrollHeight <= div.scrollTop + div.offsetHeight + SCROLL_BOTTOM_DISTANCE) {
      canScrollToBottomRef.current = true;
    } else {
      canScrollToBottomRef.current = false;
    }
  }, []);
  const onChangeScrollingDebounce = useDebouncedCallback(onChangeScrolling, 100);

  useEffect(() => {
    if (connected) {
      joinRoom();
    }
  }, [joinRoom, connected]);

  useEffect(() => {
    if (canScrollToBottomRef.current) {
      scrollToLastMessage();
    }
  }, [scrollToLastMessage]);

  return (
    <Box direction="column" className={cn(classes.wrap, { [classes.wrapMobile]: isMobile })}>
      <Header authToken={authToken} />
      <Box className={cn(classes.container, { [classes.containerMobile]: isMobile })}>
        {isMobile && (
          <Box justifyContent="space-between" className={classes.mobileTop}>
            <ChatMembersCount count={list.length} onClick={onClickMembersCount} />
            <CopyInvationBlock
              domainUrl={getDomainUrl()}
              roomName={roomInfo.roomName}
              connectPassword={roomInfo.connectPassword}
              className={classes.invationLinkMobile}
              mode="two"
            />
          </Box>
        )}
        {!isMobile && <ChatMembers className={classes.members} list={list} />}
        {isMobile && isShowMobileMembersCount && (
          <MobileChatMembers
            list={list}
            className={classes.mobileMembersCount}
            onClickCross={onClickCloseMobileMembers}
          />
        )}
        <Box className={cn(classes.chat, { [classes.chatMobile]: isMobile })}>
          <Chat
            scrollerRef={scrollerRefCallback}
            forwardRef={triggerRef}
            messages={messages.data}
            fetchNextPage={messages.fetchNextPage}
            roomInfo={roomInfo}
            onSendMessage={onSendMessage}
            firstItemIndex={firstItemIndex}
            pageSize={messages.pageSize}
            isScrolling={onChangeScrollingDebounce}
          />
        </Box>
        {!isMobile && <Info className={classes.info} roomName={roomInfo.roomName} connectPassword={roomInfo.connectPassword} />}
      </Box>
    </Box>
  );
});
