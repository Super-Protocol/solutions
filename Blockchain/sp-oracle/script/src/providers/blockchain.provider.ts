import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import Contract from 'web3-eth-contract';

import { IBlockchainProvider } from "../common/intrefaces";
import { ORACLE_ABI, GAS_LIMIT } from "../common/constants";

class BlockchainProvider implements IBlockchainProvider {
    private contractAddress: string;
    private pubAddress: string;
    private contract: Contract;
    private pk: string;
    private web3: Web3;

    constructor(nodeUrl: string, smartContractAddress: string, pk: string, pubAddress: string) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
        this.contractAddress = smartContractAddress;
        this.contract = new this.web3.eth.Contract(ORACLE_ABI as AbiItem[], this.contractAddress);
        this.pubAddress = pubAddress;
        this.pk = pk;
    }

    private async callContract(key: string, value: string, quote: string) {
        try {
            const txData = this.contract.methods.add(key, value, quote).encodeABI();
            const tx = {
                from: this.pubAddress,
                to: this.contractAddress,
                gas: GAS_LIMIT,
                data: txData,
            };
            const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.pk);
            const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!);
            console.log(`Data: ${value} with key ${key} was published. Tx: ${receipt.transactionHash}`);
        } catch(e) {
            throw Error(`Interaction with Contract was failed: ${e}`);
        }
    }

    public formatObject(data: Object, abi: Object): string {
        const encodedData = this.web3.eth.abi.encodeParameter(
            abi,
            data
        );
  
        return encodedData;
    }

    public async publish(key: string, data: string, quote: Buffer): Promise<void> {
        const bytes32Key = this.web3.utils.keccak256(key);
        const bytesQuote = '0x' + quote.toString('hex');
        await this.callContract(bytes32Key, data, bytesQuote);
    }
}

export default BlockchainProvider;