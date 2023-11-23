import { ReactNode, ReactElement } from 'react';
import { Theme } from '@/utils/types';

export interface AccordionToggleProps {
  icon?: ReactElement;
  title?: ReactNode | string;
  onSelect: (isOpen: boolean) => void;
  isOpen: boolean;
  theme?: Theme;
  dataTestId?: string;
  classNameWrap?: string;
}