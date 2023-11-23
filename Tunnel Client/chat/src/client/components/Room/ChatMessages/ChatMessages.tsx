import {
  memo, forwardRef, useMemo, useCallback,
} from 'react';
import cn from 'classnames';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Box } from '@/ui/Box';
import classes from './ChatMessages.module.scss';
import { ChatMessagesProps, MessageRender } from './types';
import { ChatMessage } from './ChatMessage';
import { ChatMessageSender } from './ChatMessageSender';
import { isMoreThenMinutes } from './helpers';

export const ChatMessages = memo(forwardRef<VirtuosoHandle, ChatMessagesProps>((
  {
    className, messages, fetchNextPage, pageSize, firstItemIndex, scrollerRef, isScrolling,
  },
  ref: React.Ref<VirtuosoHandle>,
) => {
  const messagesWithSender = useMemo(
    () => messages.map((message, index, list) => {
      return list[index - 1]?.senderId !== message.senderId
        ? { ...message, showSender: true }
        : { ...message, showSender: false };
    }),
    [messages],
  );

  const itemContent = useCallback(
    (index: number, item: MessageRender) => {
      const {
        id, createdAt, message, senderName, showSender,
      } = item;
      return (
        <Box direction="column">
          {showSender && <ChatMessageSender senderName={senderName} />}
          <ChatMessage
            isSent={!!id}
            showTime={index === 0 || isMoreThenMinutes(createdAt, messages[index - 1]?.createdAt)}
            classNameWrap={classes.message}
            text={message}
            createdAt={createdAt}
          />
        </Box>
      );
    },
    [messages],
  );

  return (
    <Box direction="column" className={cn(classes.wrap, className)}>
      <Virtuoso
        ref={ref}
        scrollerRef={scrollerRef}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={pageSize}
        startReached={fetchNextPage}
        data={messagesWithSender}
        itemContent={itemContent}
        isScrolling={isScrolling}
      />
    </Box>
  );
}));
