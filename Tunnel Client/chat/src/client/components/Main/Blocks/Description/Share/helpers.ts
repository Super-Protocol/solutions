/* eslint-disable max-len */

import { isSSR } from 'src/common/utils';

const getUrlString = () => (isSSR() ? '' : `${window.location.protocol}//${window.location.host}`);

export const getTwitterLink = () => {
  const host = encodeURIComponent(getUrlString());
  const text = encodeURIComponent('💥Testnet Phase 4 is here – the new release from @Super__Protocol, the confidential Web3 cloud! Developers can now deploy their own solutions, like this Super Chat app, secured by #confidentialcomputing. Check it out!');
  return `https://twitter.com/intent/tweet?text=${text}&url=${host}`;
};
