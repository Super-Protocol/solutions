import { memo, FC } from 'react';
import cn from 'classnames';
import { Button } from '@/ui/Buttons/Button';
import { ChatMembersCountProps } from './types';
import classes from './ChatMembersCount.module.scss';

export const ChatMembersCount: FC<ChatMembersCountProps> = memo(({
  count, onClick, className, isMobile,
}) => {
  return (
    <Button
      variant="base-link"
      className={cn(classes.wrap, className, { [classes.desktop]: !isMobile })}
      onClick={onClick}
    >
      <span>Users:</span>
      &nbsp;
      <span className={classes.count}>{count || 0}</span>
    </Button>
  );
});