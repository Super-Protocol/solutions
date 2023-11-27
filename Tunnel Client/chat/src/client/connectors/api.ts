import { QueryClient } from 'react-query';

export const queryClient = new QueryClient();

export const fetcher = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, init);
};