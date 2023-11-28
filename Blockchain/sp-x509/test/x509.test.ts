import { extractPublicKey, extractRS, parsePem, getPemCertsFromQuote } from './helper';
import { Verificator } from '../typechain-types';
import { TeeSgxParserV3 } from '../src/dist';
import { ethers, network } from 'hardhat';
import { ec as EC } from "elliptic";
import { expect } from 'chai';
import fs from 'fs';

import * as asn1js from 'asn1js';
import * as pkijs from 'pkijs';
import * as crypto from 'crypto';

describe('x509', function () {
    let snapshot: any;

    before(async function () {
        snapshot = await network.provider.request({
            method: 'evm_snapshot',
            params: [],
        });
    });

    afterEach(async function () {
        await network.provider.request({
            method: 'evm_revert',
            params: [snapshot],
        });

        snapshot = await network.provider.request({
            method: 'evm_snapshot',
            params: [],
        });
    });

    it('Should verified chain of certs OFF CHAIN', async () => {
        const leafCert = fs.readFileSync(__dirname + '/certs/certA.pem', 'utf-8');
        const intermediateCert = fs.readFileSync(__dirname + '/certs/certB.pem', 'utf-8');
        const rootCert = fs.readFileSync(__dirname + '/certs/certC.pem', 'utf-8');

        const certChain = [
            new crypto.X509Certificate(rootCert),
            new crypto.X509Certificate(intermediateCert),
            new crypto.X509Certificate(leafCert),
        ];

        // check chain
        for (const [ index, cert ] of certChain.entries()) {
            if (index > 0) {
                if (!cert.verify(certChain[index - 1].publicKey)) {
                    throw Error('invalid CA cert');
                }
            } else {
                if (!cert.verify(cert.publicKey)) {
                    throw Error('invalid root cert');
                }
            }
        }
    });
    
    it('Should verified cert on P-256 curve ON CHAIN', async function() {
        const certPem = fs.readFileSync(__dirname + '/certs/certC.pem', 'utf-8');
        const parsedCert = parsePem(certPem);

        const cert = new crypto.X509Certificate(certPem);
        const asn1Certificate = asn1js.fromBER(cert.raw);
        const certificate = new pkijs.Certificate({ schema: asn1Certificate.result });
        
        const { derSignature } = extractRS(certificate);
        const { publicKey } = extractPublicKey(certificate)

        const curve = new EC('p256');
        const extractedPb = curve.keyFromPublic(publicKey, 'hex');
        const messageHashBytes = crypto.createHash('sha256').update(certificate.tbsView).digest();
        
        // off-chain check
        expect(extractedPb.verify(messageHashBytes, derSignature)).true;

        // deploy contract via root cert
        const VerificatorFactory = await ethers.getContractFactory('Verificator');
        const verificator = ((await VerificatorFactory.deploy(parsedCert)) as any) as Verificator;
        await verificator.deployed();
    });

    it('Should verified chain of certs ON CHAIN', async () => {
        const leafCert = fs.readFileSync(__dirname + '/certs/certA.pem', 'utf-8');
        const intermediateCert = fs.readFileSync(__dirname + '/certs/certB.pem', 'utf-8');
        const rootCert = fs.readFileSync(__dirname + '/certs/certC.pem', 'utf-8');

        const rootParsed = parsePem(rootCert);
        const leafParsed = parsePem(leafCert);
        const intermediateParsed = parsePem(intermediateCert);

        // deploy contract via root cert
        const VerificatorFactory = await ethers.getContractFactory('Verificator');
        const verificator = ((await VerificatorFactory.deploy(rootParsed)) as any) as Verificator;
        await verificator.deployed();

        expect(await verificator.verifyCert(intermediateParsed, rootParsed.publicKey)).true;
        expect(await verificator.verifyCert(leafParsed, intermediateParsed.publicKey)).true;
    });

    it('Should verified full quote', async () => {
        const quoteFullPath = __dirname + '/quote/quote.dat';
        const quote = fs.readFileSync(quoteFullPath);
        const [leafCert, intermediateCert, rootCert] = getPemCertsFromQuote(quoteFullPath);

        const instance = new TeeSgxParserV3()
        const parsedQuote = instance.parseQuote(quote);
        const isvReport = instance.parseReport(parsedQuote.report);

        const rootParsed = parsePem(rootCert);
        const leafParsed = parsePem(leafCert);
        const intermediateParsed = parsePem(intermediateCert);

        // deploy contract via root cert
        const VerificatorFactory = await ethers.getContractFactory('Verificator');
        const verificator = ((await VerificatorFactory.deploy(rootParsed)) as any) as Verificator;
        await verificator.deployed();
        
        expect(await verificator.checkTEEQuote(
            leafParsed,
            intermediateParsed,
            {
                header: parsedQuote.rawHeader,
                isvReport: parsedQuote.report,
                isvReportSignature: parsedQuote.isvEnclaveReportSignature,
                attestationKey: parsedQuote.ecdsaAttestationKey,
            
                qeReport: parsedQuote.qeReport,
                qeReportSignature: parsedQuote.qeReportSignature,
                qeAuthenticationData: parsedQuote.qeAuthenticationData,
            },
            '0x' + isvReport.mrEnclave.toString('hex'),
            '0x' + isvReport.mrSigner.toString('hex'),
            '0x' + isvReport.dataHash.toString('hex'),
        )).to.eq(true);
    });
});
