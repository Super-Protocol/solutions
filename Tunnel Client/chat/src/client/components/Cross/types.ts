import { Theme } from '@/utils/types';

export interface CrossProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  theme: Theme;
  className?: string;
}