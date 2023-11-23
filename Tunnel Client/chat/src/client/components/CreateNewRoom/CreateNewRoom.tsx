import {
  useState, memo, useCallback, FC,
} from 'react';
import dynamic from 'next/dynamic';
import { ResponseData as CreateRoomResponse } from '../../../pages/api/new-room';
import { NewRoomNotification } from './NewRoomNotification';
import { CreateNewRoomForm } from './CreateNewRoomForm';
import { CreateNewRoomProps } from './types';
import classes from './CreateNewRoom.module.scss';

const Modal = dynamic(() => import('@/ui/Modal/Modal'), { ssr: false });

export const CreateNewRoom: FC<CreateNewRoomProps> = memo(({ isOpen, onClose }) => {
  const [room, setRoom] = useState<{ room: CreateRoomResponse, userName: string } | null>(null);
  const onCreateRoom = useCallback((data: { room: CreateRoomResponse, userName: string }) => {
    setRoom(data);
    onClose?.();
  }, [onClose]);
  const closeModalRoom = useCallback(() => {
    setRoom(null);
  }, []);

  return (
    <>
      <Modal
        size="lg"
        show={isOpen}
        showShadow
        onClose={onClose}
        onHide={onClose}
        dialogClassName={classes.dialog}
      >
        <CreateNewRoomForm onCreateRoom={onCreateRoom} />
      </Modal>
      <Modal
        show={!!room}
        showShadow
        size="xl"
        onClose={closeModalRoom}
      >
        {!!room?.room && (
          <NewRoomNotification
            connectPassword={room.room.connectPassword}
            deletePassword={room.room.deletePassword}
            userName={room.userName}
            roomName={room.room.roomName}
          />
        )}
      </Modal>
    </>
  );
});