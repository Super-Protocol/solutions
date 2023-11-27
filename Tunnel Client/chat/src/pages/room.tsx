import { NextPage } from 'next';
import { Room } from '@/components/Room';
import { checkRoomAuth } from '../server/getServerSideProps/checkRoomAuth';

const RoomPage: NextPage = () => {
  return <Room />;
};

export const getServerSideProps = checkRoomAuth();

export default RoomPage;
