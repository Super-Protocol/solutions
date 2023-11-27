import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import classes from './Card.module.scss';
import { CardProps } from './types';

export const Card: FC<CardProps> = memo(({ rounded, children, className }) => {
  return (
    <Box direction="column" className={cn(classes.wrap, { [classes.rounded]: rounded }, className)}>{children}</Box>
  );
});