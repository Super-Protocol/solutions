import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { Theme } from '@/utils/types';

export type Variant = 'error';

type DivBaseProps = Pick<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'style' | 'className'
>

export interface NotificationProps extends DivBaseProps {
  children?: ReactNode | string;
  variant: Variant;
  theme?: Theme;
}
