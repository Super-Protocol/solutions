import { NextPage } from 'next';
import { ConnectToRoom } from '@/components/ConnectToRoom';

const RoomPasswordPage: NextPage = () => {
  return (
    <ConnectToRoom isOpen />
  );
};

export default RoomPasswordPage;
