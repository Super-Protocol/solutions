import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useRoom } from '@/hooks/useRoom';
import { Box } from '@/ui/Box';
import classes from './Main.module.scss';
import { CreateNewRoom } from '../CreateNewRoom';
import { ConnectToRoom } from '../ConnectToRoom';
import { DeletedRoomModal } from '../DeletedRoomModal';
import { Header } from '../Header';
import {
  Title, Description, Deploy, Architecture, Footer,
} from './Blocks';

export const Main = () => {
  const [checkExpired, setCheckExpired] = useState(() => Math.random());
  const { query, replace } = useRouter();
  const { getAuthToken } = useRoom();
  const authToken = useMemo(() => getAuthToken(), [getAuthToken]);
  const [isOpenCreateNewRoom, setIsOpenCreateNewRoom] = useState(false);
  const [isOpenConnectToRoom, setIsOpenConnectToRoom] = useState(false);
  const onCloseCreateNewRoom = useCallback(() => {
    setIsOpenCreateNewRoom(false);
  }, []);
  const onCloseConnectToRoom = useCallback(() => {
    setIsOpenConnectToRoom(false);
  }, []);
  const onOpenCreateNewRoom = useCallback(() => {
    setIsOpenCreateNewRoom(true);
  }, []);
  const onOpenConnectToRoom = useCallback((mode: boolean) => {
    if (mode) {
      replace('/room');
    } else {
      setIsOpenConnectToRoom(true);
    }
  }, [replace]);
  const onCloseDeletedModal = useCallback(() => {
    replace('/');
  }, [replace]);
  const onLeaveRoom = useCallback(() => {
    setCheckExpired(Math.random());
  }, []);
  const { deleted } = query || {};

  return (
    <Box direction="column" className={classes.wrap}>
      <DeletedRoomModal show={!!deleted} onClose={onCloseDeletedModal} />
      <Header onLeaveRoom={onLeaveRoom} authToken={authToken} />
      <Box direction="column" alignItems="center">
        <CreateNewRoom isOpen={isOpenCreateNewRoom} onClose={onCloseCreateNewRoom} />
        <ConnectToRoom isOpen={isOpenConnectToRoom} onClose={onCloseConnectToRoom} />
        <Title {...{ onOpenCreateNewRoom, onOpenConnectToRoom, checkExpired }} />
        <Description />
        <Deploy />
        <Architecture />
      </Box>
      <Footer />
    </Box>
  );
};
