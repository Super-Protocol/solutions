import { Message } from '@/hooks/useSocket';

export interface ChatMessagesProps {
  className?: string;
  messages: Message[];
  fetchNextPage: () => void;
  pageSize: number;
  firstItemIndex: number;
  scrollerRef: (ref: null | HTMLElement | Window) => any;
  isScrolling?: (isScrolling: boolean) => void;
}

export interface MessageRender extends Message {
  showSender: boolean;
}