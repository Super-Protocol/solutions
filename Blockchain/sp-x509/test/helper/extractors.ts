import { Signature } from './utils';
import * as pkijs from 'pkijs';

export function extractPublicKey(cert: pkijs.Certificate): { x: string; y: string; publicKey: string} {
    const key = cert.subjectPublicKeyInfo.parsedKey;
    const hexedX = Buffer.from(key.x).toString('hex');
    const hexedY = Buffer.from(key!.y).toString('hex');
    
    return {
        x: hexedX,
        y: hexedY,
        publicKey: '04' + hexedX + hexedY,
    }
}

export function extractRS(cert: pkijs.Certificate): {r: string; s: string; derSignature: string} {
    const derSignature = Buffer.from(cert.signatureValue.valueBlock.valueHexView).toString('hex');
    const parsedSignature = Signature.importFromDER(derSignature);

    return {
        r: parsedSignature.r,
        s: parsedSignature.s,
        derSignature,
    };
}