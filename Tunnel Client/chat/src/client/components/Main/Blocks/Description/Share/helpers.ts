/* eslint-disable max-len */

import { isSSR } from 'src/common/utils';

const getUrlString = () => (isSSR() ? '' : `${window.location.protocol}//${window.location.host}`);

export const getTwitterLink = () => {
  const host = encodeURIComponent(getUrlString());
  const text = encodeURIComponent('💥Testnet Phase 3 is here – the new release from @Super__Protocol, the confidential Web3 super cloud! Introducing Super Chat: a decentralized group chat secured by #confidentialcomputing. DM me for password or create your own chat room.');
  return `https://twitter.com/intent/tweet?text=${text}&url=${host}`;
};
