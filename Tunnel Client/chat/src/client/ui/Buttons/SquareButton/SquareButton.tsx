import { forwardRef } from 'react';
import cn from 'classnames';
import { SquareButtonProps } from './types';
import { Button } from '../Button';
import classes from './SquareButton.module.scss';

export const SquareButton = forwardRef<HTMLButtonElement, SquareButtonProps>(({
  children,
  rounded = false,
  size = 'medium',
  className,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        classes.root,
        {
          [classes?.[size]]: size,
          [classes.rounded]: rounded,
        },
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

export default SquareButton;
