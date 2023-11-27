import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import { ChatMessageSenderProps } from './types';
import classes from './ChatMessageSender.module.scss';

export const ChatMessageSender: FC<ChatMessageSenderProps> = memo(({ senderName, className }) => {
  return (
    <Box direction="column" justifyContent="space-between" alignItems="flex-start" className={cn(classes.wrap, className)}>
      <Box className={classes.name}>
        <span className={classes.nameText}>{senderName}</span>
      </Box>
    </Box>
  );
});