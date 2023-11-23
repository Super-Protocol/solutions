import * as Yup from 'yup';
import { Fields, FormValues } from './types';

export const getValidationSchema = (): Yup.Schema<FormValues> => {
  return Yup.object({
    [Fields.password]: Yup.string().test(
      Fields.password,
      'Invalid password entered',
      (value) => !!(value && value.trim()?.length),
    ).required('Required'),
  });
};

export const getInitialValues = (): FormValues => ({ password: '' });