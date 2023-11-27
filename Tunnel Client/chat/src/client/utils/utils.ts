import { getCookie } from 'cookies-next';
import { memo } from 'react';
import { isSSR } from '../../common/utils';
import { Cookies } from '../../common/constants';

export const getAuthorizationToken = (): string => getCookie(Cookies.AUTH_TOKEN) as string || '';

export const genericMemo: <T>(component: T) => T = memo;

export const getDomainUrl = (): string => (isSSR() ? '' : `${window.location.protocol}//${window.location.host}`);