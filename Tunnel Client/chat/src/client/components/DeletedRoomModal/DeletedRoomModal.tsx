import {
  memo, FC,
} from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@/ui/Box';
import { Button } from '@/ui/Buttons/Button';
import { Attention } from '@/components/Attention';
import { DeletedRoomModalProps } from './types';
import classes from './DeletedRoomModal.module.scss';

const Modal = dynamic(() => import('@/ui/Modal/Modal'), { ssr: false });

export const DeletedRoomModal: FC<DeletedRoomModalProps> = memo(({
  show, onClose,
}) => {
  return (
    <Modal
      size="lg"
      show={show}
      showShadow
      onClose={onClose}
    >
      <Box direction="column">
        <Attention
          title="Your Room has been deleted"
          className={classes.attention}
        />
        <Button
          onClick={onClose}
        >
          Ok
        </Button>
      </Box>
    </Modal>
  );
});
