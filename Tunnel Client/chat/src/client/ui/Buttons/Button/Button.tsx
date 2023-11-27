import { forwardRef, useMemo, memo } from 'react';
import cn from 'classnames';
import Link from 'next/link';
import { Theme } from '@/utils/types';
import { Spinner } from '@/ui/Spinner';
import { Box } from '@/ui/Box';
import classes from './Button.module.scss';
import { ButtonProps } from './types';

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({
  children = null,
  disabled = false,
  loading = false,
  wide = false,
  active = false,
  error = false,
  variant = 'base',
  fullWidth,
  href,
  className,
  onClick = () => {},
  loadingPosition = 'center',
  loadingWithText = true,
  sizeLoader,
  theme = Theme.dark,
  target,
  ...props
}, ref) => {
  const Content = useMemo(() => (loading
    ? (
      <Box justifyContent="center">
        <Spinner
          as="span"
          size={sizeLoader}
          role="status"
          aria-hidden="true"
          animation="border"
          variant={variant === 'base' ? 'black' : 'base'}
          className={
            loadingPosition === 'center'
              ? classes['loading-center']
              : classes.loading
          }
        />
        {loadingWithText && children}
      </Box>
    )
    : children), [children, loading, sizeLoader, loadingPosition, loadingWithText, variant]);
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        classes.root,
        classes[variant],
        classes[theme],
        {
          [classes.disabled]: disabled || loading,
          [classes.wide]: wide,
          [classes.fullWidth]: fullWidth,
          [classes.active]: active,
          [classes.error]: error,
        },
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {href ? <Link href={href} target={target} className={classes.link}>{Content}</Link> : Content}
    </button>
  );
}));
