import { ButtonCommonProps } from '../Button/types';

export type sizes = 'small' | 'medium' | 'large';

export interface SquareButtonProps extends ButtonCommonProps {
  rounded?: boolean;
  size?: sizes;
}