import {
  memo, useState, useCallback, FC,
} from 'react';
import { useRouter } from 'next/router';
import { leaveRoom as leaveRoomConnector } from '@/connectors/rooms';
import { Box } from '@/ui/Box';
import { DeleteRoomModal } from '@/components/DeleteRoomModal';
import { Button } from '@/ui/Buttons/Button';
import classes from './RoomBtns.module.scss';
import { RoomBtnsProps } from './types';

export const RoomBtns: FC<RoomBtnsProps> = memo(({ onLeaveRoom }) => {
  const router = useRouter();
  const [isShowDeleteRoomModal, setIsShowDeleteRoomModal] = useState(false);
  const { replace } = router;
  const [loadingLeave, setLoadingLeave] = useState(false);
  const handleLeaveRoom = useCallback(async () => {
    try {
      setLoadingLeave(true);
      await leaveRoomConnector().catch(() => {});
      replace('/');
      onLeaveRoom?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeave(false);
    }
  }, [replace, onLeaveRoom]);

  const onDeleteRoom = useCallback(async () => {
    try {
      await leaveRoomConnector().catch(() => {});
      replace({ pathname: '/', query: { deleted: true } });
      onLeaveRoom?.();
    } catch (e) {
      console.error(e);
    }
  }, [onLeaveRoom, replace]);

  const handleDeleteRoom = useCallback(() => {
    setIsShowDeleteRoomModal(true);
  }, []);

  const onCloseDeleteRoomModal = useCallback(() => {
    setIsShowDeleteRoomModal(false);
  }, []);
  return (
    <>
      <DeleteRoomModal
        show={isShowDeleteRoomModal}
        onDelete={onDeleteRoom}
        onClose={onCloseDeleteRoomModal}
      />
      <Box justifyContent="center" className={classes.btns}>
        <Button variant="base-link" disabled={loadingLeave} onClick={handleLeaveRoom}>Leave Room</Button>
        <span className={classes.dot}>•</span>
        <Button variant="base-link" onClick={handleDeleteRoom}>Delete Room</Button>
      </Box>
    </>
  );
});