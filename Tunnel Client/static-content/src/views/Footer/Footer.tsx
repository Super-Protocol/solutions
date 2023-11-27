import { Logo, Social } from '@/common/components';
import { Box, Link } from '@/ui';
import { links } from '@/common/data';
import { copyright } from './helpers';
import classes from './Footer.module.scss';

export const Footer = () => (
  <Box className={classes.content} direction="column">
    <Box alignItems="flex-start" justifyContent="space-between" className={classes.footer}>
      <Box alignItems="flex-start" className={classes.logoGroup}>
        <Logo className={classes.logo} />
        <Box className={classes.linksGroup}>
          <Box direction="column">
            {links.slice(0, 2).map(({ id, title, href }) => (
              <Link key={id} href={href}>{title}</Link>
            ))}
          </Box>
          <Box direction="column">
            {links.slice(2).map(({ id, title, href }) => (
              <Link key={id} href={href}>{title}</Link>
            ))}
          </Box>
        </Box>
      </Box>
      <Social className={classes.socialGroup} />
    </Box>
    <Box justifyContent="center">
      <div className={classes.copyright}>{copyright}</div>
    </Box>
  </Box>
);
