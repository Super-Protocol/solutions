import type {
  ReactNode, DetailedHTMLProps, ButtonHTMLAttributes, MouseEventHandler,
} from 'react';
import { Theme } from '@/utils/types';

export type variants = 'base' | 'base-link' | 'black' | 'white' | 'transparent';

export type sizes = 'small' | 'medium' | 'large';

type ButtonBaseProps = Pick<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'title' | 'type' | 'style' | 'className' | 'disabled'
>

export type LoadingPosition = 'center';

export interface ButtonCommonProps extends ButtonBaseProps {
  children: ReactNode | string;
  variant?: variants;
  onClick?: MouseEventHandler;
  active?: boolean;
  loading?: boolean;
  theme?: Theme;
  target?: string;
}

export interface ButtonProps extends ButtonCommonProps {
  wide?: boolean;
  fullWidth?: boolean;
  href?: string;
  error?: boolean;
  loadingPosition?: LoadingPosition;
  loadingWithText?: boolean;
  sizeLoader?: sizes;
}