import {
  memo, FC,
} from 'react';
import { Card } from '@/ui/Card';
import { RoomBtns } from '@/components/RoomBtns';
import { Box } from '@/ui/Box';
import { useMobile } from '@/contexts/MobileContext';
import { ChatMembersList } from '@/components/ChatMembersList';
import { ChatMembersCount } from '@/components/ChatMembersCount';
import { ChatMembersProps } from './types';
import classes from './ChatMembers.module.scss';

export const ChatMembers: FC<ChatMembersProps> = memo(({ className, list, onLeaveRoom }) => {
  const { isMobile } = useMobile();
  return (
    <Card rounded className={className}>
      <Box direction="column" className={classes.membersWrap}>
        <ChatMembersCount count={list.length} className={classes.count} isMobile={isMobile} />
        <ChatMembersList list={list} className={classes.members} />
      </Box>
      <Box>
        <RoomBtns onLeaveRoom={onLeaveRoom} />
      </Box>
    </Card>
  );
});