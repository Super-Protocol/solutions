import { SyntheticEvent, useCallback, useState } from 'react';

import { Box, Link, Burger } from '@/ui';
import { Logo, Social } from '@/common/components';
import { hrefTestNet } from '@/common/constants';
import { links } from '@/common/data';
import { MobileMenu } from './MobileMenu';
import classes from './Header.module.scss';

export const Header = () => {
  const [show, setShow] = useState(false);
  const onClickMenu = useCallback((e: SyntheticEvent) => {
    e.preventDefault();
    setShow((prev) => !prev);
  }, []);

  return (
    <>
      <nav className={classes.content}>
        <Logo />
        <Box className={classes.linksGroup} justifyContent="space-between">
          {links.map(({ id, title, href }) => (
            <Link key={id} href={href}>{title}</Link>
          ))}
        </Box>
        <Box alignItems="center" className={classes.right}>
          <Social icons={['discord']} className={classes.socialGroup} />
          <Link href={hrefTestNet}>
            <Box className={classes.btn} alignItems="center" justifyContent="center">
              Join Testnet
            </Box>
          </Link>
        </Box>
        <Burger className={classes.burder} onClick={onClickMenu} />
      </nav>
      {show && <MobileMenu onClick={onClickMenu} />}
    </>
  );
};
