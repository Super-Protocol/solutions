import {
  memo, forwardRef, useMemo,
} from 'react';
import dayjs from 'dayjs';
import cn from 'classnames';
import xss from 'xss';

import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import { ChatMessageProps } from './types';
import { linkify, options } from './helpers';
import classes from './ChatMessage.module.scss';

export const ChatMessage = memo(forwardRef<HTMLDivElement, ChatMessageProps>(({
  text, createdAt, classNameWrap, isSent = false, showTime = true,
}, ref?: React.Ref<HTMLDivElement>) => {
  const time = useMemo(() => dayjs(createdAt).format('HH:mm • MMM DD'), [createdAt]);
  const markup = useMemo(() => ({ __html: xss(linkify(text), options) }), [text]);

  return (
    <Box
      justifyContent="space-between"
      className={cn(classes.wrap, { [classes.sent]: isSent }, classNameWrap)}
      ref={ref}
      alignItems="flex-start"
    >
      <Box className={classes.messageContainer}>
        <div
          className={classes.message}
          dangerouslySetInnerHTML={markup} // eslint-disable-line react/no-danger
        />
      </Box>
      <Box className={cn(classes.time, { [classes.hideTime]: !showTime })} alignItems="center">
        <Icon
          name="clock"
          width={12}
          height={12}
          className={cn(classes.icon, { [classes.notSent]: isSent })}
        />
        <span>{time}</span>
      </Box>
    </Box>
  );
}));
