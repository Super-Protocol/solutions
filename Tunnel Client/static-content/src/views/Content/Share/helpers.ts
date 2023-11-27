/* eslint-disable max-len */

export const getTwitterLink = () => {
  const host = encodeURIComponent(`${window.location.protocol}//${window.location.host}`);
  const text = encodeURIComponent('💥 I have been selected to participate in the second phase of the closed @Super__Protocol testnet. This is the website I have deployed in its decentralized confidential environment, available for 72 hours. Protected by #confidentialcomputing⚡️');
  return `https://twitter.com/intent/tweet?text=${text}&url=${host}`;
};
