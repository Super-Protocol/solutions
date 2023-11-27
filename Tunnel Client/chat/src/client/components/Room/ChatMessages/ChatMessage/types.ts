export interface ChatMessageProps {
  text: string;
  createdAt: string;
  classNameWrap?: string;
  isSent?: boolean;
  showTime?: boolean;
}