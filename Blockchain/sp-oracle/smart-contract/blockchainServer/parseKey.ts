export interface Account {
  address: string;
  key: string;
}

export const parseAccounts = (data: string): Account[] => {
  const addresses = Array.from(data.matchAll(/Account #\d+: ([\dA-z]+)/gm)).map(
    (result) => result[1],
  );
  const keys = Array.from(data.matchAll(/Private Key: ([\dA-z]+)/gm)).map((result) => result[1]);
  return addresses.map((address, index) => ({
    address,
    key: keys[index],
  }));
};
