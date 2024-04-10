import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { InputOffer, ProviderOffersJson } from './types';

export async function readAndValidateInput(inputDir: string): Promise<{
  inputOffers: InputOffer[];
  spctlConfigPath: string;
}> {
  const requiredFiles = ['.env', 'config.json'];
  const inputFiles = await fs.readdir(inputDir);

  if (requiredFiles.some((fileName) => !inputFiles.includes(fileName))) {
    throw new Error(`Input dir ${inputDir} does not have all required files`);
  }

  const envVars = await readEnvFile(inputDir);

  return {
    inputOffers: getInputOffers(envVars.PROVIDER_OFFERS_JSON),
    spctlConfigPath: path.join(inputDir, requiredFiles[1]),
  };
}

function getInputOffers(providerOffersJson: ProviderOffersJson): InputOffer[] {
  return providerOffersJson.map((item) => {
    return {
      id: item.id,
      resourceFileContent: {
        encryption: item.encryption,
        resource: item.resource,
      },
    };
  });
}

async function readEnvFile(
  inputDir: string,
): Promise<{ PROVIDER_OFFERS_JSON: ProviderOffersJson }> {
  const envFilePath = path.join(inputDir, '.env');
  const envFileContent = await fs.readFile(envFilePath);
  const envVars = dotenv.parse(envFileContent);

  if (!envVars.PROVIDER_OFFERS_JSON) {
    throw new Error(`File ${envFilePath} must have PROVIDER_OFFERS_JSON`);
  }

  return {
    PROVIDER_OFFERS_JSON: JSON.parse(envVars.PROVIDER_OFFERS_JSON),
  };
}
