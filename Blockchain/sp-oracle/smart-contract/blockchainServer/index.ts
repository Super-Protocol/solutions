import http from 'http';
import { startBlockChain } from './startBlockchain';
import { prepareRootCertificates } from './prepareCertificates';
import { deployContract } from './deployContract';
import { prepareInputConfig } from './prepareInputConfig';
import { saveTestAppCommands } from './saveTestAppCommands';

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

  const deployVerifierCommand = `npx hardhat deploy-x509-mock --network localhost`;
  const verifierAddress = await deployContract(deployVerifierCommand);
  console.log(`Verifier successfully deployed, Address: ${verifierAddress}`);

  const mrEnclave = '4d42d7b15b5acbcab74d10fa9192829af91c1a2b3d341bfe0fa7a02b547b34f0';
  const mrSigner = '4a5cb479b8a30fa3821b88aa29bad04788ea006a9e09925bf3ec36398fc9d64b';
  const deployOracleCommand = `npx hardhat deploy-oracle --publishers ${account.address} --verifier ${verifierAddress} --enclave ${mrEnclave} --signer ${mrSigner} --network localhost`;
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
