export const getAuthorizationHeader = (token?: string | null): string => (token ? `Bearer ${token}` : '');

export const isSSR = () => typeof window === 'undefined';

export function parseJwt<T>(token?: string): T | null {
  if (!token) return null;
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

export const isRelative = (path?: string) => path && /^\/[a-zA-Z]/.test(path);

export const getQSFromObj = (params: object): string => {
  const qs = Object
    .entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as any)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

export const getPathFromUrl = (url?: string): string => {
  if (!url) return '';
  return url.split('?')[0] || '';
};

export const deleteKeysFromObject = (obj: object, keys: string[]): object => {
  if (obj instanceof Object && Array.isArray(keys) && keys.length) {
    return keys.reduce((acc, key) => {
      delete acc[key];
      return acc;
    }, { ...obj } as any);
  }
  return obj;
};
