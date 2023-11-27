/* eslint-disable max-len */
import { User } from '../ChatMembersList/types';

export const getMembersList = (values: any): User[] => {
  const kv: Record<string, string> = values.reduce((acc: Record<string, string>, { token, name }: { token: string, name: string }) => (
    { ...acc, [token]: name }), {});
  return Object.entries(kv).reduce((acc: User[], [id, name]) => ([...acc, {
    id, name,
  }]), []);
};

export const SCROLL_BOTTOM_DISTANCE = 100;