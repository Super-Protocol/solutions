import { promises as fsPromise } from 'fs';
import { Account } from './parseKey';

const inputConfigFileNames = [`input.json`, 'input.example.json'];
const resultFileName = `input.local.json`;

export const prepareInputConfig = async (
  inputPath: string,
  account: Account,
  oracleAddress: string,
  outputPath: string,
): Promise<void> => {
  const dir = await fsPromise.readdir(inputPath);

  const inputFileName = dir.find((item) => inputConfigFileNames.includes(item));
  if (!inputFileName) {
    throw new Error(`Input file is missing!`);
  }

  const inputFile = await fsPromise.readFile(`${inputPath}/${inputFileName}`);
  const inputConfig = JSON.parse(inputFile.toString());

  inputConfig.smartContractAddress = oracleAddress;
  inputConfig.publisher.pk = account.key;
  inputConfig.publisher.address = account.address;

  await fsPromise.writeFile(
    `${outputPath}/${resultFileName}`,
    JSON.stringify(inputConfig, null, 2),
  );
};
