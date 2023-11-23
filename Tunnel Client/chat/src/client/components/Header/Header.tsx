import {
  memo, useCallback, useState, FC,
} from 'react';
import cn from 'classnames';

import { useTheme } from '@/contexts/ThemeContext';
import { useMobile } from '@/contexts/MobileContext';
import { Box } from '@/ui/Box';
import { Button } from '@/ui/Buttons/Button';
import { Burger } from '@/components/Burger';
import { MobileBurgerInfo } from '@/components/MobileBurgerInfo';
import { HeaderProps } from './types';
import classes from './Header.module.scss';
import { Logo } from '../Logo';
import { PageLinks } from '../PageLinks';
import { SocialLinks } from '../SocialLinks';

export const Header: FC<HeaderProps> = memo(({ onLeaveRoom: onLeaveRoomProp, authToken }) => {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const [isOpenMobileBurger, setIsOpenMobileBurger] = useState(false);
  const onClickBurger = useCallback(() => {
    setIsOpenMobileBurger(true);
  }, []);
  const onClickCross = useCallback(() => {
    setIsOpenMobileBurger(false);
  }, []);
  const onLeaveRoom = useCallback(() => {
    setIsOpenMobileBurger(false);
    onLeaveRoomProp?.();
  }, [onLeaveRoomProp]);
  return (
    <Box className={classes.content} justifyContent="center">
      <Box justifyContent="space-between" className={cn(classes.wrap)}>
        <Button className={classes.logo} variant="base-link" href="/">
          <Logo theme={theme} />
        </Button>
        {!isMobile && (
          <>
            <PageLinks className={classes.pageLinks} />
            <SocialLinks className={classes.socialLinks} />
          </>
        )}
        {isMobile && (
          <Burger theme={theme} onClick={onClickBurger} />
        )}
        {isMobile && isOpenMobileBurger && (
          <MobileBurgerInfo
            className={classes.mobileBurgerInfo}
            onClickCross={onClickCross}
            onLeaveRoom={onLeaveRoom}
            authToken={authToken}
          />
        )}
      </Box>
    </Box>
  );
});