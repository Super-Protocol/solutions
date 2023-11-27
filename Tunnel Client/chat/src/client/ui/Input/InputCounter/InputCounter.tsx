import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import { InputCounterProps } from './types';
import classes from './InputCounter.module.scss';

export const InputCounter: FC<InputCounterProps> = memo(({ count, max, inValid }) => {
  return (
    <Box className={cn(classes.wrap, { [classes.invalid]: inValid })}>{count}/{max}</Box>
  );
});