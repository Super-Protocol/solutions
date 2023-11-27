import cn from 'classnames';
import { memo, FC } from 'react';
import { Button } from '@/ui/Buttons/Button';
import { PageLinkProps } from './types';
import classes from './PageLink.module.scss';

export const PageLink: FC<PageLinkProps> = memo(({ href, title, className }) => {
  return <Button variant="base-link" target="_blank" href={href} className={cn(classes.link, className)}>{title}</Button>;
});