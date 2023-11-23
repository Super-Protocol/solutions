import { memo, useMemo, forwardRef } from 'react';
import cn from 'classnames';
import { BoxProps } from './types';
import classes from './Box.module.scss';

export const Box = memo(forwardRef<HTMLDivElement, BoxProps>(({
  children,
  alignItems = 'stretch',
  direction = 'row',
  wrap = 'nowrap',
  justifyContent = 'flex-start',
  className,
  onClick,
  Tag = 'div',
  ...props
}, ref) => {
  const resultClassName = useMemo(() => {
    return cn(classes.flex, {
      [classes.directionRow]: direction === 'row',
      [classes.directionColumn]: direction === 'column',
      [classes.directionColumnReverse]: direction === 'column-reverse',
      [classes.directionRowReverse]: direction === 'row-reverse',
      [classes.wrapNowrap]: wrap === 'nowrap',
      [classes.wrapWrap]: wrap === 'wrap',
      [classes.wrapWrapReverse]: wrap === 'wrap-reverse',
      [classes.justifyCenter]: justifyContent === 'center',
      [classes.justifyFlexEnd]: justifyContent === 'flex-end',
      [classes.justifyFlexStart]: justifyContent === 'flex-start',
      [classes.justifySpaceAround]: justifyContent === 'space-around',
      [classes.justifySpaceBetween]: justifyContent === 'space-between',
      [classes.alignItemsBaseline]: alignItems === 'baseline',
      [classes.alignItemsCenter]: alignItems === 'center',
      [classes.alignItemsFlexEnd]: alignItems === 'flex-end',
      [classes.alignItemsFlexStart]: alignItems === 'flex-start',
      [classes.alignItemsStretch]: alignItems === 'stretch',
    }, className);
  }, [direction, wrap, justifyContent, alignItems, className]);

  return (
    <Tag
      className={resultClassName}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {children}
    </Tag>
  );
}));
