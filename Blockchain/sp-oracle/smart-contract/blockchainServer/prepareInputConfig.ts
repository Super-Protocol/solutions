import { promises as fsPromise } from 'fs';
import { Account } from './parseKey';

const inputConfigFileNames = [`input.json`, 'input.example.json'];
const resultFileName = `input.local.json`;

export const prepareInputConfig = async (
  folderPath: string,
  account: Account,
  oracleAddress: string,
): Promise<void> => {
  const dir = await fsPromise.readdir(folderPath);

  const inputFileName = dir.find((item) => inputConfigFileNames.includes(item));
  if (!inputFileName) {
    throw new Error(`Input file is missing!`);
  }

  const inputFile = await fsPromise.readFile(`${folderPath}/${inputFileName}`);
  const inputConfig = JSON.parse(inputFile.toString());

  inputConfig.smartContractAddress = oracleAddress;
  inputConfig.publisher.pk = account.key;
  inputConfig.publisher.address = account.address;

  await fsPromise.writeFile(
    `${folderPath}/${resultFileName}`,
    JSON.stringify(inputConfig, null, 2),
  );
};
