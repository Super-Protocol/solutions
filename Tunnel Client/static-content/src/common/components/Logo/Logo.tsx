import { memo } from 'react';
import cn from 'classnames';

import { Link } from '@/ui';
import logo_b from '@/assets/logo_b.svg';
import logo_w from '@/assets/logo_w.svg';
import { LogoProps } from './types';
import classes from './Logo.module.scss';

export const Logo = memo(({ className, logoType = 'black' }: LogoProps) => (
  <Link href="https://superprotocol.com">
    <img src={logoType === 'black' ? logo_b : logo_w} alt="" className={cn(classes.logo, className)} />
  </Link>
));
