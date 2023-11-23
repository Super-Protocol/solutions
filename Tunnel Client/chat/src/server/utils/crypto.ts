import { createECDH } from 'crypto';
import {
  generateMnemonic as generateMnemonicBip39,
  mnemonicToEntropy as mnemonicToEntropyBip39,
  validateMnemonic as validateMnemonicBip39,
} from 'bip39';

export interface GenerateECIESKeysResult {
    privateKeyBase64: string;
    publicKeyBase64: string;
    privateKeyBuffer: Buffer;
    publicKeyBuffer: Buffer;
    mnemonic: string;
}
export interface GenerateRandomKeysResult {
    privateKeyBuffer: Buffer;
    publicKeyBuffer: Buffer;
    privateKeyBase64: string;
    publicKeyBase64: string;
}

export const generateMnemonic = (): string => generateMnemonicBip39(256);

export const generateECIESKeys = (mnemonic: string): GenerateECIESKeysResult => {
  const entropy = mnemonicToEntropyBip39(mnemonic);
  const privateKeyBuffer = Buffer.from(entropy, 'hex');
  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(privateKeyBuffer);
  const publicKeyBuffer = ecdh.getPublicKey();
  const privateKeyBase64 = privateKeyBuffer.toString('base64');
  const publicKeyBase64 = publicKeyBuffer.toString('base64');
  return {
    privateKeyBase64,
    publicKeyBase64,
    privateKeyBuffer,
    publicKeyBuffer,
    mnemonic,
  };
};

export const validateMnemonic = (mnemonic: string): boolean => {
  let validate = validateMnemonicBip39(mnemonic);
  if (!validate) return validate;
  try {
    generateECIESKeys(mnemonic);
  } catch (e) {
    validate = false;
  }
  return validate;
};

export const generateRandomKeys = (): GenerateRandomKeysResult => {
  const ecdh = createECDH('secp256k1');
  ecdh.generateKeys();
  const privateKeyBuffer = ecdh.getPrivateKey();
  const publicKeyBuffer = ecdh.getPublicKey();
  const privateKeyBase64 = privateKeyBuffer.toString('base64');
  const publicKeyBase64 = publicKeyBuffer.toString('base64');
  return {
    privateKeyBuffer,
    publicKeyBuffer,
    privateKeyBase64,
    publicKeyBase64,
  };
};