import { memo } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import classes from './Error.module.scss';

export const Error = memo(() => {
  return (
    <Box className={cn(classes.wrap)}>
      Unavailable
    </Box>
  );
});