import { forwardRef } from 'react';
import cn from 'classnames';

import classes from './Cross.module.scss';
import { CrossProps } from './types';

export const Cross = forwardRef<HTMLDivElement, CrossProps>(({ theme, className, ...props }, ref) => (
  <div className={cn(classes.container, className)} ref={ref} {...props}>
    <span className={cn(classes.cross, classes[theme])} />
  </div>
));
