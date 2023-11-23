import {
  FC, memo, useCallback, useEffect,
} from 'react';
import ModalBootstrap from 'react-bootstrap/Modal';
import cn from 'classnames';
import { Button } from '@/ui/Buttons/Button';
import { Icon } from '@/ui/Icon';
import { Theme } from '@/utils/types';
import classes from './Modal.module.scss';
import { ModalProps } from './types';

export const Modal: FC<ModalProps> = memo(({
  dialogClassName,
  contentClassName,
  backdropClassName,
  bodyClassName,
  children,
  onClose: onCloseProp,
  isShowCloseBtn = false,
  showShadow = false,
  theme = Theme.dark,
  onShow: onShowProp,
  ...props
}) => {
  const onShow = useCallback(() => {
    document.documentElement.classList.add('is-locked');
    onShowProp?.();
  }, [onShowProp]);
  const onClose = useCallback(() => {
    document.documentElement.classList.remove('is-locked');
    onCloseProp?.();
  }, [onCloseProp]);
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('is-locked');
    };
  }, []);

  return (
    <ModalBootstrap
      size="sm"
      centered
      dialogClassName={cn(classes.dialog, dialogClassName, classes[`root_${theme}`])}
      backdropClassName={cn(classes.backdrop, backdropClassName, classes[`backdrop_${theme}`])}
      contentClassName={cn(classes.content, contentClassName, { [classes.shadow]: showShadow }, classes[`content_${theme}`])}
      {...props}
      onHide={onClose}
      onShow={onShow}
    >
      <ModalBootstrap.Body className={bodyClassName}>
        {isShowCloseBtn && !!onClose && (
          <Button variant="white" className={classes.btnClose} onClick={onClose}>
            <Icon name="close" widht={14} />
          </Button>
        )}
        {children}
      </ModalBootstrap.Body>
    </ModalBootstrap>
  );
});

export default Modal;
