import { useTheme } from '@/contexts/ThemeContext';
import { Box } from '@/ui/Box';
import { Logo } from '@/components/Logo';
import { PageLinks } from '@/components/PageLinks';
import { SocialLinks } from '@/components/SocialLinks';
import classes from './Footer.module.scss';

export const Footer = () => {
  const { theme } = useTheme();
  return (
    <Box className={classes.content} justifyContent="center">
      <Box direction="column" className={classes.wrapper}>
        <Box className={classes.logoMobile}>
          <Logo theme={theme} />
        </Box>
        <Box className={classes.wrap}>
          <Box className={classes.logo}>
            <Logo theme={theme} />
          </Box>
          <PageLinks className={classes.pageLinks} />
          <SocialLinks className={classes.socialLinks} />
        </Box>
      </Box>
    </Box>
  );
};
