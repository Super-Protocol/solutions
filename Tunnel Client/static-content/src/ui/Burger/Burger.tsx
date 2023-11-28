import cn from 'classnames';

import { Box } from '../Box';
import { BurderProps } from './types';
import classes from './Burger.module.scss';

export const Burger = ({ className, onClick }: BurderProps) => {
  return (
    <Box className={cn(classes.content, className)} onClick={onClick} direction="column" justifyContent="space-between">
      <span className={classes.line} />
      <span className={classes.line} />
      <span className={classes.line} />
    </Box>
  );
};
