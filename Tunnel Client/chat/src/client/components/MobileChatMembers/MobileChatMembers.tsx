import { memo, FC } from 'react';
import cn from 'classnames';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { Box } from '@/ui/Box';
import { Cross } from '@/components/Cross';
import { ChatMembersCount } from '@/components/ChatMembersCount';
import { ChatMembersList } from '@/components/ChatMembersList';
import classes from './MobileChatMembers.module.scss';
import { MobileChatMembersProps } from './types';

export const MobileChatMembers: FC<MobileChatMembersProps> = memo(({ className, onClickCross, list }) => {
  const { theme } = useTheme();
  return (
    <Box direction="column" className={cn(classes.wrap, className)}>
      <Box alignItems="center" justifyContent="space-between" className={classes.header}>
        <Box>
          <Logo theme={theme} />
        </Box>
        <Box>
          <Cross theme={theme} onClick={onClickCross} />
        </Box>
      </Box>
      <Box direction="column" alignItems="center" className={classes.content}>
        <ChatMembersCount count={list.length} className={classes.membersCount} onClick={onClickCross} />
        <ChatMembersList list={list} className={classes.membersList} />
      </Box>
    </Box>
  );
});