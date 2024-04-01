const wt = require('worker_threads');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const https = require('https');

const execPromise = util.promisify(exec);

const serverJsPath = process.argv[2];

if (!serverJsPath) {
  throw 'Path to server.js is not set as argument';
}

const checkWithInterval = async (handler, intervalTime, maxChecks) => {
  console.log(`Checking with interval ${intervalTime}`);
  let interval = null;
  let checkedTimes = 0;
  try {
    return await new Promise((resolve, reject) => {
      const intervalFn = async () => {
        try {
          const result = await handler();

          resolve(result);
        } catch (err) {
          console.error(err.message, `Retrying...`);
          checkedTimes += 1;
          if (checkedTimes >= maxChecks) {
            console.error(err.message, `checkWithInterval: MaxCheck count reached! Abort...`);

            reject(err);
          }
        }
      };

      interval = setInterval(intervalFn, intervalTime);
    });
  } finally {
    clearInterval(interval);
  }
};

const privateKeyFile = `private.pem`;
const certificateFile = `certificate.crt`;
const opensslCommand = `openssl req -newkey rsa:2048 -nodes -keyout ${privateKeyFile} -x509 -days 365 -out ${certificateFile} -subj "/CN=localhost"`;

const port = 9090;

async function run() {
  const checkInterval = 10000; //10 sec
  try {
    await execPromise(opensslCommand);
    const tlsKey = (await fs.readFile(privateKeyFile)).toString();
    const tlsCert = (await fs.readFile(certificateFile)).toString();
    console.log('Starting worker');

    const worker = new wt.Worker(serverJsPath, {
      env: {
        ...process.env,
        HTTPS_PORT: port,
        TLS_CERT: tlsCert,
        TLS_KEY: tlsKey,
      },
    });

    worker.once('error', (error) => {
      console.error(error.message, 'Worker error was occurred');
    });

    worker.once('exit', (exitCode) => {
      console.log('Worker was exist');

      if (exitCode !== 0) {
        throw new Error(`Cannot start server. Exit code: ${exitCode}`);
      }
    });

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        worker.postMessage(signal);
      });
    });

    const checkFn = () => {
      return new Promise((resolve, reject) => {
        const requestOptions = {
          port,
          method: 'GET',
          host: 'localhost',
          ca: tlsCert,
        };

        const req = https.request(requestOptions, (res) => {
          const certificate = res.socket.getPeerCertificate(false);
          if (!certificate) {
            reject(new Error(`There isn't certificate for internal server`));
          }
          console.log('Certificate is checked');
          resolve();
        });
        req.on('error', (error) => {
          reject(error);
        });
        req.on('timeout', () => {
          reject(new Error('timeout error'));
        });
        req.end();
      });
    };

    const maxChecks = 1 + Math.floor(30000 / checkInterval);

    await checkWithInterval(checkFn, checkInterval, maxChecks);

    const terminationHandler = (signal) => {
      console.log(`${signal} received`);
      worker.terminate();
      process.exit(0);
    };

    process
      .on('SIGINT', () => terminationHandler('SIGINT'))
      .on('SIGTERM', () => terminationHandler('SIGTERM'))
      .on('SIGABRT', () => terminationHandler('SIGABRT'));

    console.log('Server started');
  } catch (error) {
    console.error(error.message, 'Fail to start a server');

    throw error;
  } finally {
    await fs.unlink(privateKeyFile).catch(() => {} /* suppress */);
    await fs.unlink(certificateFile).catch(() => {} /* suppress */);
  }
}

run().catch(console.err);
