import { TeeSgxParser } from '@super-protocol/sdk-js';

import { IQuoteParser } from '../common/intrefaces';
import { ChunkedX509Cert } from '../dto/cert.dto';
import { ChunkedSGXQuote } from '../dto/quote.dto';

class QuoteParser implements IQuoteParser {
  private quoteData: Buffer;
  private deviceCert: ChunkedX509Cert;
  private intermediateCert: ChunkedX509Cert;
  private rootCert: ChunkedX509Cert;
  private header: Uint8Array;
  private isvReport: Uint8Array;
  private isvReportSignature: Uint8Array;
  private attestationKey: Uint8Array;
  private qeReport: Uint8Array;
  private qeReportSignature: Uint8Array;
  private qeAuthenticationData: Uint8Array;

  constructor(quoteData: Buffer) {
    this.quoteData = quoteData;
    const instance = new TeeSgxParser();
    const parsedQuote = instance.parseQuote(this.quoteData);
    this.deviceCert = parsedQuote.certificates.device.x509Data;
    this.intermediateCert = parsedQuote.certificates.platform.x509Data;
    this.rootCert = parsedQuote.certificates.root.x509Data;
    this.header = parsedQuote.rawHeader;
    this.isvReport = parsedQuote.report;
    this.isvReportSignature = parsedQuote.isvEnclaveReportSignature;
    this.attestationKey = parsedQuote.ecdsaAttestationKey;
    this.qeReport = parsedQuote.qeReport;
    this.qeReportSignature = parsedQuote.qeReportSignature;
    this.qeAuthenticationData = parsedQuote.qeAuthenticationData;
  }

  public parseQuote(): ChunkedSGXQuote {
    return {
      header: this.header,
      isvReport: this.isvReport,
      isvReportSignature: this.isvReportSignature,
      attestationKey: this.attestationKey,
      qeReport: this.qeReport,
      qeReportSignature: this.qeReportSignature,
      qeAuthenticationData: this.qeAuthenticationData,
    };
  }

  public parseCerts(): ChunkedX509Cert[] {
    return [this.deviceCert, this.intermediateCert, this.rootCert];
  }
}

export default QuoteParser;
