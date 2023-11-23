import { memo } from 'react';
import cn from 'classnames';
import { Spinner as SpinnerBootstrap } from 'react-bootstrap';
import classes from './Spinner.module.scss';
import { SpinnerProps, SpinnerWrapperProps } from './types';

const Component = ({
  animation = 'border',
  className,
  size = 'medium',
  variant = 'base',
  ...props
}: SpinnerProps) => {
  return (
    <SpinnerBootstrap
      animation={animation}
      className={cn(classes.spinner, { [classes?.[size]]: size }, classes?.[variant], className)}
      {...props}
    />
  );
};

export const Spinner = memo(({
  fullscreen = false,
  classNameWrap,
  ...props
}: SpinnerWrapperProps) => {
  if (fullscreen) {
    return (
      <div className={cn(classes.wrap, classNameWrap)}>
        <Component {...props} />
      </div>
    );
  }
  return <Component {...props} />;
});
