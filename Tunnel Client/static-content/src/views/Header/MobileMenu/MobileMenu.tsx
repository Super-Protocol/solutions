import { useEffect } from 'react';

import { Box, Link } from '@/ui';
import { Logo } from '@/common/components';
import { links } from '@/common/data';
import { MobileMenuProps } from './types';
import classes from './MobileMenu.module.scss';

export const MobileMenu = ({ onClick }: MobileMenuProps) => {
  useEffect(() => {
    document.body.classList.add('disable-scroll');

    return () => {
      document.body.classList.remove('disable-scroll');
    };
  }, []);

  return (
    <Box className={classes.content}>
      <Box className={classes.menu} alignItems="center" justifyContent="space-between">
        <Logo logoType="white" />
        <div className={classes.cross} onClick={onClick} />
      </Box>
      <Box direction="column" className={classes.links} justifyContent="center">
        {links.map(({ id, title, href }) => (
          <Link key={id} href={href} className={classes.link}>{title}</Link>
        ))}
      </Box>
      <Box className={classes.socialLinks} alignItems="center" justifyContent="space-between">
        <Link href="https://discord.com/invite/superprotocol">
          <div className={classes.icon1} />
        </Link>
        <Link href="https://t.me/superprotocol">
          <div className={classes.icon2} />
        </Link>
        <Link href="https://twitter.com/super__protocol">
          <div className={classes.icon3} />
        </Link>
        <Link href="https://www.facebook.com/superprotocol">
          <div className={classes.icon4} />
        </Link>
      </Box>
      <Link href="https://docs.superprotocol.com/testnet">
        <Box className={classes.button} alignItems="center" justifyContent="center">
          Join Testnet
        </Box>
      </Link>
    </Box>
  );
};
