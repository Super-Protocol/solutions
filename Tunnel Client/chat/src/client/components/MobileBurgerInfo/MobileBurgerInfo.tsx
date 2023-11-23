import { memo, FC } from 'react';
import cn from 'classnames';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { Box } from '@/ui/Box';
import { Cross } from '@/components/Cross';
import { PageLinks } from '@/components/PageLinks';
import { SocialLinks } from '@/components/SocialLinks';
import { RoomBtns } from '@/components/RoomBtns';
import { Button } from '@/ui/Buttons/Button';
import classes from './MobileBurgerInfo.module.scss';
import { MobileBurgerInfoProps } from './types';
import { InfoAccordion } from '../Room/InfoAccordion';

export const MobileBurgerInfo: FC<MobileBurgerInfoProps> = memo(({
  className, onClickCross, onLeaveRoom, authToken,
}) => {
  const { theme } = useTheme();

  return (
    <Box direction="column" justifyContent="flex-start" className={cn(classes.wrap, className)}>
      <Box alignItems="center" justifyContent="space-between" className={classes.header}>
        <Button className={classes.logo} variant="base-link" href="/">
          <Logo theme={theme} />
        </Button>
        <Box>
          <Cross theme={theme} onClick={onClickCross} />
        </Box>
      </Box>
      <Box direction="column" alignItems="center" className={classes.content}>
        <PageLinks className={classes.pageLinks} />
        <SocialLinks className={classes.socialLinks} />
        <InfoAccordion className={classes.list} />
      </Box>
      {!!authToken && (
        <Box alignItems="center" justifyContent="center" className={classes.footer}>
          <RoomBtns onLeaveRoom={onLeaveRoom} />
        </Box>
      )}
    </Box>
  );
});