import { SyntheticEvent } from 'react';
import { Theme } from '@/utils/types';

export interface LogoProps {
  onClick?: (e: SyntheticEvent) => void;
  className?: string;
  theme: Theme;
}