import { memo, FC, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ConnectToRoomForm } from './ConnectToRoomForm';
import { ConnectToRoomProps } from './types';
import classes from './ConnectToRoom.module.scss';

const Modal = dynamic(() => import('@/ui/Modal/Modal'), { ssr: false });

export const ConnectToRoom: FC<ConnectToRoomProps> = memo(({ isOpen, onClose }) => {
  const { push } = useRouter();
  const onCreateRoom = useCallback(() => {
    push('/room');
  }, [push]);
  return (
    <Modal
      size="lg"
      show={isOpen}
      showShadow
      onClose={onClose}
      onHide={onClose}
      dialogClassName={classes.dialog}
    >
      <ConnectToRoomForm onCreateRoom={onCreateRoom} />
    </Modal>
  );
});