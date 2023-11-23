import {
  memo, FC,
} from 'react';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import { Card } from '@/ui/Card';
import { ChatMessages } from '../ChatMessages';
import classes from './Chat.module.scss';
import { ChatProps } from './types';

const ChatEditor = dynamic(() => import('../ChatEditor/ChatEditor'), { ssr: false });

export const Chat: FC<ChatProps> = memo(({
  className, messages, firstItemIndex, fetchNextPage, pageSize, roomInfo, onSendMessage, forwardRef, scrollerRef, isScrolling,
}) => {
  return (
    <Card rounded className={cn(classes.wrap, className)}>
      <Box className={classes.title}>
        <span className={classes.titleText}>{roomInfo.roomName}</span>
      </Box>
      <Box className={classes.messages}>
        {!!messages?.length && (
          <ChatMessages
            firstItemIndex={firstItemIndex}
            fetchNextPage={fetchNextPage}
            scrollerRef={scrollerRef}
            ref={forwardRef}
            messages={messages}
            pageSize={pageSize}
            isScrolling={isScrolling}
          />
        )}
      </Box>
      <ChatEditor onSendMessage={onSendMessage} />
    </Card>
  );
});

export default Chat;