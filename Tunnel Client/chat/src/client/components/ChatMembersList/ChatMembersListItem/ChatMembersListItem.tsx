import { memo, FC } from 'react';
import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import { ChatMembersListItemProps } from './types';
import classes from './ChatMembersListItem.module.scss';

export const ChatMembersListItem: FC<ChatMembersListItemProps> = memo(({ name, className }) => {
  return (
    <Box direction="row" alignItems="center" className={className}>
      <Icon
        width={14}
        name="profile"
        className={classes.icon}
      />
      <span className={classes.name}>{name}</span>
    </Box>
  );
});