import { extractPublicKey, extractRS } from './extractors';
import fs from 'fs';
import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
import * as crypto from 'crypto';


interface ChunkedX509Cert {
    bodyPartOne: string;
    publicKey: string;
    bodyPartTwo: string;
    signature: string;
}

export function parsePem(pem: string): ChunkedX509Cert {
    const cert = new crypto.X509Certificate(pem);
    const asn1Certificate = asn1js.fromBER(cert.raw);
    const certificate = new pkijs.Certificate({ schema: asn1Certificate.result });

    const tbs = certificate.tbsView;

    const { r, s } = extractRS(certificate);
    const { x, y } = extractPublicKey(certificate);
    const splitedTbs = Buffer.from(tbs).toString('hex').split(x+y);
    // TODO: extract exp date

    return {
        bodyPartOne: '0x' + splitedTbs[0],
        publicKey: '0x' + x + y,
        bodyPartTwo: '0x' + splitedTbs[1],
        signature: '0x' + r + s,
    };
}

export function getPemCertsFromQuote(quoteFullPath: string) {
    const START = '-----BEGIN CERTIFICATE-----';
    const END = '-----END CERTIFICATE-----';

    let certs = [];
    let quoteUtf8 = fs.readFileSync(quoteFullPath, 'utf-8');
    while(quoteUtf8.indexOf(START) !== -1) {
        const startIndex = quoteUtf8.indexOf(START);
        const endIndex = quoteUtf8.indexOf(END);

        const clippedCert = quoteUtf8.slice(startIndex, endIndex + END.length);
        certs.push(clippedCert);

        quoteUtf8 = quoteUtf8.slice(endIndex + END.length, quoteUtf8.length - 1);
    }

    return certs;
};
