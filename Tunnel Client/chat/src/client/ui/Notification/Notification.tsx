import cn from 'classnames';
import { Theme } from '@/utils/types';
import { Box } from '../Box';
import { NotificationProps } from './types';
import classes from './Notification.module.scss';

export const Notification = ({
  children, variant, className, theme = Theme.dark, ...props
}: NotificationProps) => {
  return (
    <Box
      className={cn(
        classes.root,
        classes?.[variant],
        classes[theme],
        className,
      )}
      justifyContent="flex-start"
      alignItems="flex-start"
      {...props}
    >
      {children}
    </Box>
  );
};
