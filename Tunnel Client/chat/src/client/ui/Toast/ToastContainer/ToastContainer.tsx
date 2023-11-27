import { useCallback, FC } from 'react';
import {
  ToastContainer as ToastContainerToastify,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Icon } from '@/ui/Icon';
import { SquareButton } from '@/ui/Buttons/SquareButton';
import { Theme } from '@/utils/types';
import classes from './ToastContainer.module.scss';
import { ToastContainerProps } from './types';

export const ToastContainer: FC<ToastContainerProps> = ({ theme = Theme.dark }) => {
  const closeButton = useCallback(() => (
    <SquareButton theme={theme} variant={theme === Theme.dark ? 'black' : 'white'} rounded className={classes.btnClose}>
      <Icon name="close" width={14} />
    </SquareButton>
  ), [theme]);
  return (
    <ToastContainerToastify
      className={classes[theme]}
      closeButton={closeButton}
    />
  );
};
