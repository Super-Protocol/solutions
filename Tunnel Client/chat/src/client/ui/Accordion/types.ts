import { ReactNode, ReactElement } from 'react';
import { Theme } from '@/utils/types';

export interface AccordionProps {
  theme?: Theme;
  children?: ReactNode | string;
  isOpen?: boolean;
  icon?: ReactElement;
  title?: ReactNode | string;
  classNameWrap?: string;
  classNameCollapse?: string;
  classNameOpen?: string;
  classNameToggleWrap?: string;
  dataTestId?: string;
  fullWidth?: boolean;
  onSelect?: (isOpen: boolean) => void;
}
