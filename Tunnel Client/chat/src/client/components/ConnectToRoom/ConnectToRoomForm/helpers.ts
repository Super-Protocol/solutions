import * as Yup from 'yup';
import { getConfig } from '@/utils/config';
import { Fields } from './types';

export const getValidationSchema = (): any => {
  return Yup.object({
    [Fields.name]: Yup.string().test(
      Fields.name,
      'Invalid name entered',
      (value) => !!(value && value.trim()?.length),
    )
      .required('Required')
      .max(
        getConfig().MAX_USER_NAME_SYMBOLS,
        `Must be less than ${getConfig().MAX_USER_NAME_SYMBOLS} characters`,
      ),
    [Fields.password]: Yup.string().test(
      Fields.password,
      'Invalid password entered',
      (value) => !!(value && value.trim()?.length),
    ).required('Required'),
  });
};

export const initialValues = {
  [Fields.name]: '',
  [Fields.password]: '',
};