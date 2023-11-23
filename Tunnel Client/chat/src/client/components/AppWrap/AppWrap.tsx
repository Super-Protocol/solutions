import { FC, memo } from 'react';
import { ToastContainer } from '@/ui/Toast/ToastContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { AppWrapProps } from './types';

export const AppWrap: FC<AppWrapProps> = memo(({ children }) => {
  const { theme } = useTheme();
  return (
    <>
      {children}
      <ToastContainer theme={theme} />
    </>
  );
});