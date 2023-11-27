import { VirtuosoHandle } from 'react-virtuoso';
import { Ref } from 'react';
import { Message } from '@/hooks/useSocket';
import { RoomInfo } from '@/hooks/useRoom';

export interface ChatProps {
  className?: string;
  messages: Message[];
  firstItemIndex: number;
  fetchNextPage: () => void;
  pageSize: number;
  roomInfo: RoomInfo;
  onSendMessage: (message: string) => void;
  forwardRef: Ref<VirtuosoHandle>; // doesn't work with dynamic import
  scrollerRef: (ref: null | HTMLElement | Window) => any;
  isScrolling?: (isScrolling: boolean) => void;
}