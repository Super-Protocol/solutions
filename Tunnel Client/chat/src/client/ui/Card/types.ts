import { ReactNode } from 'react';

export interface CardProps {
  rounded?: boolean;
  children: ReactNode | string;
  className?: string;
}