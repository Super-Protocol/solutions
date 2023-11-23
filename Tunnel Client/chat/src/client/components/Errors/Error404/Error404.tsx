import { memo } from 'react';
import { Box } from '@/ui/Box';
import classes from './Error404.module.scss';

export const Error404 = memo(() => {
  return (
    <Box className={classes.wrap}>
      <Box direction="column">
        <Box className={classes.text}>Page not found</Box>
        <Box className={classes.textStatus}>404</Box>
      </Box>
    </Box>
  );
});