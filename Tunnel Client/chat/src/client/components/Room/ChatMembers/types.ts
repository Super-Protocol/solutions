import { User } from '@/components/ChatMembersList/types';

export interface ChatMembersProps {
  className?: string;
  list: User[];
  onLeaveRoom?: () => void;
}