import { ReactNode } from 'react';

export interface CopyBlockProps {
  title: string;
  text?: string;
  className?: string;
  classNameText?: string;
  onCopy?: () => void;
  children?: ReactNode;
  copyText?: string;
}