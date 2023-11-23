import {
  useCallback, useLayoutEffect, useState,
} from 'react';
import cn from 'classnames';
import Link from 'next/link';

import { useRoom } from '@/hooks/useRoom';
import { Box } from '@/ui/Box';
import classes from '../Title.module.scss';
import { hrefGuide, btnsText } from '../helpers';
import { ButtonsJoinChatProps } from './types';

const [btnCreateOpen, btnReturn, btnJoin] = btnsText;

const ButtonsJoinChat = ({ onOpenCreateNewRoom, onOpenConnectToRoom, checkExpired }: ButtonsJoinChatProps) => {
  const { getIsExpiredToken } = useRoom();
  const [isConnectedToRoom, setIsConnectedToRoom] = useState(false);

  const onClickJoinChat = useCallback(() => {
    onOpenConnectToRoom(isConnectedToRoom);
  }, [onOpenConnectToRoom, isConnectedToRoom]);

  useLayoutEffect(() => {
    setIsConnectedToRoom(!getIsExpiredToken());
  }, [getIsExpiredToken, checkExpired]);

  return (
    <Box className={classes.btns}>
      <div
        className={cn(classes.btn, isConnectedToRoom ? classes.firstBtnConnected : classes.firstBtn)}
        onClick={onOpenCreateNewRoom}
      >
        {btnCreateOpen}
      </div>
      <div className={classes.btn} onClick={onClickJoinChat}>{isConnectedToRoom ? btnReturn : btnJoin}</div>
      <Link
        href={hrefGuide}
        target="_blank"
        className={cn(classes.linkGuide, classes.link)}
      >
        Read chat guide
      </Link>
    </Box>
  );
};

export default ButtonsJoinChat;
