import http from 'http';
import { startBlockChain } from './startBlockchain';
import { prepareRootCertificates } from './prepareCertificates';
import { deployContract } from './deployContract';
import { prepareInputConfig } from './prepareInputConfig';
import { saveTestAppCommands } from './saveTestAppCommands';
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
  await prepareRootCertificates(inputPath);
  console.log('Root certificates are saved!');

  await prepareInputConfig(inputPath, account, oracleAddress);
  console.log('Input config prepared');

  const testAppFile = await saveTestAppCommands(appAddress);
  console.log(`Test app commands are saved to ${testAppFile}`);

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
