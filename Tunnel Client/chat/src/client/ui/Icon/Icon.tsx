import React, {
  forwardRef, ForwardRefExoticComponent, memo, useMemo,
} from 'react';
import cn from 'classnames';
import icons from '@/assets/icons.svg';
import { IconProps } from './types';
import classes from './Icon.module.scss';

export const Icon: ForwardRefExoticComponent<IconProps> = memo(forwardRef(({
  name,
  height,
  width = 20,
  className,
  ...props
}, ref?: React.Ref<SVGSVGElement>) => {
  const style = useMemo(() => {
    return (height || width)
      ? { ...(width ? { width: `${width}px`, minWidth: `${width}px` } : {}), height: `${height || width}px` }
      : undefined;
  }, [height, width]);

  return (
    <svg
      ref={ref}
      className={cn(classes.icon, className)}
      style={style}
      {...props}
    >
      <use href={`${icons}#${name}`} />
    </svg>
  );
}));
