import { FC } from 'react';
import cn from 'classnames';

import { LinkProps } from './types';
import classes from './Link.module.scss';

export const Link: FC<LinkProps> = ({ children, href, className }) => {
  return (
    <a className={cn(classes.link, className)} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
