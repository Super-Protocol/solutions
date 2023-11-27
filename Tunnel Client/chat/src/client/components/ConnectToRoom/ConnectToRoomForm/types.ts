export enum Fields {
  name = 'name',
  password = 'password',
}

export interface FormValues {
  name: string;
  password: string;
}

export interface ConnectToRoomFormProps {
  onCreateRoom?: () => void;
}