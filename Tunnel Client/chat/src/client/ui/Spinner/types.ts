import { SpinnerProps as SpinnerPropsBootstrap } from 'react-bootstrap';

export type sizes = 'small' | 'medium' | 'large';

export type variants = 'base' | 'black';

export interface SpinnerProps extends Omit<SpinnerPropsBootstrap, 'animation' | 'size'> {
  animation?: 'border' | 'grow';
  size?: sizes,
  className?: string;
  variant?: variants;
}

export interface SpinnerWrapperProps extends SpinnerProps {
  fullscreen?: boolean;
  classNameWrap?: string;
}