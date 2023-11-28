import { ReactNode, SyntheticEvent, LegacyRef } from 'react';

export type flexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type flexJusifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-around' | 'space-between';
export type flexAlignItems = 'stretch' | 'baseline' | 'center' | 'flex-start' | 'flex-end';
export type flexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface BoxProps {
  container?: boolean;
  children?: ReactNode | string;
  direction?: flexDirection;
  justifyContent?: flexJusifyContent;
  wrap?: flexWrap;
  alignItems?: flexAlignItems;
  className?: string;
  onClick?: (event: SyntheticEvent) => void;
  onTransitionEnd?: (event: SyntheticEvent) => void;
  onMouseEnter?: (event: SyntheticEvent) => void;
  onMouseLeave?: (event: SyntheticEvent) => void;
  ref?: LegacyRef<HTMLDivElement>;
  style?: Record<string, string>;
  'data-testid'?: string;
}
