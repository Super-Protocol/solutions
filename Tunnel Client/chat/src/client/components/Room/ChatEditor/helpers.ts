import * as Yup from 'yup';
import { Fields, FormValues } from './types';

export const getValidationSchema = (): Yup.Schema<FormValues> => {
  return Yup.object({
    [Fields.message]: Yup.string().test(
      Fields.message,
      'Invalid message entered',
      (value) => !!(value && value.trim()?.length),
    )
      .required('Required'),
  });
};

export const getInitialValues = () => ({ message: '' });