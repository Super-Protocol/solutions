import { SyntheticEvent } from 'react';
import { User } from '@/components/ChatMembersList/types';

export interface MobileChatMembersProps {
  className?: string;
  onClickCross?: (event: SyntheticEvent) => void;
  list: User[];
}