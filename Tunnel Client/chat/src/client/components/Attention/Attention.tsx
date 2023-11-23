import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import { Icon } from '@/ui/Icon';
import classes from './Attention.module.scss';
import { AttentionProps } from './types';

export const Attention: FC<AttentionProps> = memo(({ text, title, className }) => {
  return (
    <Box direction="column" className={cn(classes.wrap, className)} alignItems="center" justifyContent="center">
      <Box direction="column" alignItems="center" justifyContent="center" className={classes.attention}>
        <Icon name="warning" width={24} />
        <Box className={classes.text}>{title}</Box>
      </Box>
      {!!text && <Box className={classes.subText}>{text}</Box>}
    </Box>
  );
});