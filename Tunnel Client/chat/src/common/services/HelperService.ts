export interface IHelperService {
  textToBase64(text: string): string;
  textFromBase64(base64: string): string;
  bufferFromHex(hex: string): Buffer;
}

export class HelperService implements IHelperService {
  public textToBase64(text: string): string {
    if (!text || typeof text !== 'string') return '';
    return Buffer.from(text).toString('base64');
  }
  public textFromBase64(base64: string): string {
    if (!base64 || typeof base64 !== 'string') return '';
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  public bufferFromHex(hex: string): Buffer {
    return Buffer.from(hex, 'hex');
  }
}