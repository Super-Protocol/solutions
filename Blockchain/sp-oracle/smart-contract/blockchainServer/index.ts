import http from 'http';
import { startBlockChain } from './startBlockchain';
import { prepareRootCertificates } from './prepareCertificates';
import { deployContract } from './deployContract';
import { prepareInputConfig } from './prepareInputConfig';
import { getTestAppCommands } from './saveTestAppCommands';
import quoteMock from '../../shared/quoteMock.json';

let healthcheckServer: http.Server;
const healthcheckServerPort = 9000;

const terminateHandle = (signal: string) => {
  console.log(`Catch signal. Stopping process with: ${signal}`);
  if (healthcheckServer) {
    healthcheckServer.close();
  }
  process.exit(0);
};

process.on('SIGINT', terminateHandle).on('SIGABRT', terminateHandle).on('SIGTERM', terminateHandle);

async function prepareBlockchain(): Promise<void> {
  const account = await startBlockChain();
  console.log('Blockchain successfully started!');

  const deployVerifierCommand = `cd verifier && npx hardhat deploy --cert ./intel-root-cert.pem --network localhost`;
  const verifierAddress = await deployContract(deployVerifierCommand);
  console.log(`Verifier successfully deployed, Address: ${verifierAddress}`);

  const deployOracleCommand = `npx hardhat deploy-oracle --publishers ${account.address} --verifier ${verifierAddress} --enclave ${quoteMock.mrEnclave} --signer ${quoteMock.mrSigner} --network localhost`;
  const oracleAddress = await deployContract(deployOracleCommand);
  console.log(`Oracle successfully deployed, Address: ${oracleAddress}`);

  const deployAppCommand = `npx hardhat deploy-app --oracle ${oracleAddress} --network localhost`;
  const appAddress = await deployContract(deployAppCommand);
  console.log(`App successfully deployed, Address: ${appAddress}`);

  const inputPath = process.env.INPUT_DIR!;
  const outputPath = process.env.OUTPUT_PATH!;
  await prepareRootCertificates(inputPath, outputPath);
  console.log('Root certificates are saved!');

  await prepareInputConfig(inputPath, account, oracleAddress, outputPath);
  console.log('Input config prepared');

  const testAppCommands = getTestAppCommands(appAddress);

  console.log(
    `\n\nTo test app please use these commands inside "smart-contract" folder${[
      '',
      ...testAppCommands,
      '',
    ].join('\n\t')}\n\n`,
  );

  healthcheckServer = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('OK!');
  });
  healthcheckServer.listen(healthcheckServerPort, () => {
    console.log(`Healthcheck server started at port ${healthcheckServerPort}`);
  });
}

prepareBlockchain().catch((error) => {
  console.error(error);
  process.exit(1);
});
