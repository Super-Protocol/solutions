import { SyntheticEvent } from 'react';

export interface MobileBurgerInfoProps {
  className?: string;
  onClickCross?: (event: SyntheticEvent) => void;
  onLeaveRoom?: () => void;
  authToken: string;
}