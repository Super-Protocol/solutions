import Web3, { AbiInput, Contract, TransactionReceipt } from 'web3';

import { IBlockchainProvider } from '../common/intrefaces';
import { ORACLE_ABI, GAS_LIMIT } from '../common/constants';
import { getErrorMessage } from '../common/utils';
import { PublicData } from '../common/types';

import { ChunkedX509Cert } from '../dto/cert.dto';
import { ChunkedSGXQuote } from '../dto/quote.dto';
import { ExchangeRateAbi } from '../dto/exchangeRate.dto';

class BlockchainProvider implements IBlockchainProvider {
  private session?: { address: string; privateKey: string };
  private contractAddress: string;
  private pubAddress: string;
  private contract: Contract<typeof ORACLE_ABI>;
  private pubPrivateKey: string;
  private web3: Web3;
  private nonce?: number;

  constructor(
    nodeUrl: string,
    smartContractAddress: string,
    pubPrivateKey: string,
    pubAddress: string,
  ) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
    this.contractAddress = smartContractAddress;
    this.contract = new this.web3.eth.Contract<typeof ORACLE_ABI>(
      ORACLE_ABI,
      this.contractAddress,
      this.web3,
    );
    this.pubAddress = pubAddress;
    this.pubPrivateKey = pubPrivateKey;
  }

  private async sendTx(txData: string, privateKey: string): Promise<TransactionReceipt> {
    const gasPrice = Number(await this.web3.eth.getGasPrice());
    const tx = {
      from: this.pubAddress,
      to: this.contractAddress,
      gasPrice,
      gas: GAS_LIMIT,
      data: txData,
    };
    const signedTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);

    return await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  }

  private async callAdd(
    key: string,
    value: string,
    signature: string,
    callback: string,
  ): Promise<void> {
    try {
      const txData = this.contract.methods.add(key, value, signature, callback).encodeABI();
      try {
        const receipt = await this.sendTx(txData, this.pubPrivateKey);
        console.log(`Data: ${value} with key ${key} was published. Tx: ${receipt.transactionHash}`);
      } catch (e) {
        console.log(`Tx failed. The reason: ${e}`);
      }
    } catch (e) {
      throw Error(`Adding new data to the Contract failed: ${getErrorMessage(e)}`);
    }
  }

  private convertObjectToHex(data: object, abi: AbiInput): string {
    const encodedData = this.web3.eth.abi.encodeParameter(abi, data);

    return encodedData;
  }

  public initSessionKey() {
    this.nonce = 0;
    this.session = this.web3.eth.accounts.create();
    console.log('Session key generated');
  }

  public getSessionIdHash(): Buffer {
    if (!this.session) {
      throw Error('One must initialize the session before getting it id hash.');
    }

    const sessionIdHash = this.web3.utils.keccak256(this.session!.address).slice(2);
    return Buffer.from(sessionIdHash, 'hex');
  }

  public async applyNewSession(
    deviceCert: ChunkedX509Cert,
    intermediateCert: ChunkedX509Cert,
    quote: ChunkedSGXQuote,
  ): Promise<void> {
    console.log('deviceCert', deviceCert);
    console.log('intermediateCert', intermediateCert);
    console.log('quote', quote);
    console.log('session', this.session!.address);
    try {
      const txData = this.contract.methods
        .initSessionKey(deviceCert, intermediateCert, quote, this.session!.address)
        .encodeABI();
      const receipt = await this.sendTx(txData, this.pubPrivateKey);
      console.log(
        `Session key: ${this.session!.address} was initialized: ${receipt.transactionHash}`,
      );
    } catch (e) {
      throw Error(`Session initialazing via the Contract failed: ${getErrorMessage(e)}`);
    }
  }

  public async publish(key: string, data: PublicData): Promise<void> {
    if (!this.session) {
        throw Error(`One must initialize the session before starting to publish`);
    }

    const bytes32Key = this.web3.utils.keccak256(key);
    const callback = '0x'; // optional

    data.nonce = ++this.nonce!;
    const encodedHexData = this.convertObjectToHex(data, ExchangeRateAbi);

    const dataHash = this.web3.utils.keccak256(encodedHexData);
    const signature = this.web3.eth.accounts.sign(dataHash, this.session.privateKey).signature;

    await this.callAdd(bytes32Key, encodedHexData, signature, callback);
  }
}

export default BlockchainProvider;
