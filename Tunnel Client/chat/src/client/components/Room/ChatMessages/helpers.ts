import dayjs from 'dayjs';

export const isMoreThenMinutes = (first: string, second: string, minutes = 1) => {
  if (!first || !second) return false;
  return dayjs(first).diff(dayjs(second), 'minutes') >= minutes;
};