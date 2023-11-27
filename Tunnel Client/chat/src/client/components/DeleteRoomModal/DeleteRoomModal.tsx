import {
  memo, FC,
} from 'react';
import dynamic from 'next/dynamic';
import { DeleteRoomForm } from './DeleteRoomForm';
import { DeleteRoomModalProps } from './types';

const Modal = dynamic(() => import('@/ui/Modal/Modal'), { ssr: false });

export const DeleteRoomModal: FC<DeleteRoomModalProps> = memo(({
  show, onClose, onDelete,
}) => {
  return (
    <Modal
      size="xl"
      show={show}
      showShadow
      onClose={onClose}
    >
      <DeleteRoomForm onDeleteRoom={onDelete} />
    </Modal>
  );
});
