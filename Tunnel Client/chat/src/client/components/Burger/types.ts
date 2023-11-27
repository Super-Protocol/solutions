import { SyntheticEvent } from 'react';
import { Theme } from '@/utils/types';

export interface BurgerProps {
  theme: Theme;
  onClick?: (e: SyntheticEvent) => void;
}