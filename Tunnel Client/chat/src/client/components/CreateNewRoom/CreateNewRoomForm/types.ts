import { ResponseData as CreateRoomResponse } from '../../../../pages/api/new-room';

export enum Fields {
  userName = 'userName',
  roomName = 'roomName',
}

export interface FormValues {
  [Fields.userName]: string;
  [Fields.roomName]: string;
}

export interface CreateNewRoomFormProps {
  onCreateRoom: (data: { room: CreateRoomResponse, userName: string; }) => void;
}