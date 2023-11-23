import { memo, FC } from 'react';
import cn from 'classnames';
import { Box } from '@/ui/Box';
import classes from './Logo.module.scss';
import { LogoProps } from './types';

export const Logo: FC<LogoProps> = memo(({ onClick, theme, className }) => (
  <Box className={cn(classes.container, className, classes[theme])} onClick={onClick} />
));

export default Logo;