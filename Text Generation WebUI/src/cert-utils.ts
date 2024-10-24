import crypto, { X509Certificate } from 'crypto';
import tls from 'tls';

export const isCertValid = (params: { certificate: string; privateKey: string }): boolean => {
  const { certificate, privateKey } = params;
  const cert = new X509Certificate(certificate);
  const key = crypto.createPrivateKey(privateKey);

  return cert.checkPrivateKey(key) && new Date(cert.validTo).getTime() > Date.now();
};

const isIssuerValid = (subjectCert: X509Certificate, issuerCert: X509Certificate): boolean => {
  return subjectCert.checkIssued(issuerCert) && subjectCert.verify(issuerCert.publicKey);
};

export const verifyCertificateChain = (
  certificateChain: string[],
  rootCertificates?: string[],
): boolean => {
  const certChain = certificateChain.map((cert) => new X509Certificate(cert));
  const rootCerts = (rootCertificates || tls.rootCertificates).map(
    (cert) => new X509Certificate(cert),
  );

  for (let i = 0; i < certChain.length - 1; i++) {
    const subjectCert = certChain[i];
    const issuerCert = certChain[i + 1];

    if (!isIssuerValid(subjectCert, issuerCert)) {
      return false;
    }
  }

  const rootCertOfChain = certChain.at(-1);
  if (!rootCertOfChain) {
    return false;
  }

  return rootCerts.some((rootCert) => isIssuerValid(rootCertOfChain, rootCert));
};

export const parseFullchainPem = (fullchainPem: string): string[] => {
  return fullchainPem.split(/(?=-----BEGIN CERTIFICATE-----)/);
};
