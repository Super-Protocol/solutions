import { ToastContent, ToastContentProps } from 'react-toastify';
import { Theme } from '@/utils/types';

export type Type = 'success' | 'error';

export interface ToastBodyProps<TData = undefined> extends ToastContentProps<TData> {
  type: Type;
  content?: ToastContent<TData>;
  theme?: Theme;
}