import * as Yup from 'yup';
import { getConfig } from '@/utils/config';
import { Fields, FormValues } from './types';

const config = getConfig();

export const getValidationSchema = (): Yup.Schema<FormValues> => {
  return Yup.object({
    [Fields.userName]: Yup.string().test(
      Fields.userName,
      'Invalid user name entered',
      (value) => !!(value && value.trim()?.length),
    )
      .required('Required')
      .max(
        config.MAX_USER_NAME_SYMBOLS,
        `Must be less than ${config.MAX_USER_NAME_SYMBOLS} characters`,
      ),
    [Fields.roomName]: Yup.string().test(
      Fields.roomName,
      'Invalid room name entered',
      (value) => !!(value && value.trim()?.length),
    )
      .required('Required')
      .max(
        config.MAX_ROOM_NAME_SYMBOLS,
        `Must be less than ${config.MAX_ROOM_NAME_SYMBOLS} characters`,
      ),
  });
};

export const getInitialValues = (): FormValues => ({ userName: '', roomName: '' });