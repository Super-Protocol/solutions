import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import { ChatMembersListProps } from './types';
import { ChatMembersListItem } from './ChatMembersListItem';
import classes from './ChatMembersList.module.scss';

export const ChatMembersList: FC<ChatMembersListProps> = memo(({ list, className }) => {
  return (
    <Box direction="column" className={cn(classes.list, className)}>
      {list.map(({ id, name }) => <ChatMembersListItem key={id} name={name} className={classes.item} />)}
    </Box>
  );
});