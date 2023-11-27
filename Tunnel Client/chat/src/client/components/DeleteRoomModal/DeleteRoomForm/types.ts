export enum Fields {
  password = 'password',
}

export interface FormValues {
  [Fields.password]: string;
}

export interface DeleteRoomFormProps {
  onDeleteRoom: () => void;
}