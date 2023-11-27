import { MouseEventHandler } from 'react';

export interface ChatMembersCountProps {
  count?: number;
  onClick?: MouseEventHandler;
  className?: string;
  isMobile?: boolean;
}