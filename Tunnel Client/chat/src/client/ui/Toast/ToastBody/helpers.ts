import { Type } from './types';

export const Types = {
  success: 'Success',
  error: 'Error',
};

export const getTitle = (type: Type) => `${Types[type]}.`;