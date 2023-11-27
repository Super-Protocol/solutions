import next from 'next';
import { getHeapStatistics } from 'v8';
import http, { Server as HTTPServer } from 'http';
import https, { Server as HTTPSServer } from 'https';
import { isMainThread, parentPort } from 'worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Server as SocketIoServer } from 'socket.io';
import { SocketService } from './src/server/services/socket/SocketService';
import { db } from './src/server/services/db';
import config from './next.config';
import logger from './src/server/services/logger';

const env = process.env.APP_NODE_ENV || 'production';
const dev = env !== 'production';

const nextApp = next({
  dev,
  dir: '.',
  ...(dev ? {} : { dir: fileURLToPath(new URL('..', pathToFileURL(__filename).toString())), conf: config }),
});

const serverLogger = logger.child({ class: 'server' });

serverLogger.info({ heapInfo: getHeapStatistics() }, 'Heap info');

const initTerminationHandler = (server: HTTPServer | HTTPSServer, socket: SocketService) => {
  let isTerminationTriggered = false;

  const terminationHandler = async () => {
    if (isTerminationTriggered) {
      serverLogger.info('Termination is already triggered. Skiping...');
      return;
    }

    isTerminationTriggered = true;

    serverLogger.info('Termination signal received. Stopping...');
    socket.io.close();
    await socket.removeUsersBySockets();

    server.close(async () => {
      serverLogger.info('Server closed');

      await db.shutdown().catch((error) => serverLogger.error({ error }, 'Error on db.shutdown'));

      process.exit(0);
    });
  };

  const handledSignals = ['SIGINT', 'SIGTERM']; // SIGKILL terminate server
  if (isMainThread) {
    handledSignals.forEach((signal) => {
      process.on(signal, terminationHandler);
    });
  } else {
    parentPort?.on('message', (message) => {
      if (handledSignals.includes(message)) {
        terminationHandler();
      }
    });
  }
};

nextApp
  .prepare()
  .then(async () => {
    const handler = nextApp.getRequestHandler();
    const port = parseInt(process.env.HTTPS_PORT || '', 10) || 3000;
    const server = dev || !process.env.TLS_CERT || !process.env.TLS_KEY
      ? http.createServer(handler)
      : https.createServer(
        {
          rejectUnauthorized: true,
          cert: process.env.TLS_CERT,
          key: process.env.TLS_KEY,
        },
        handler,
      );

    await db.connect();

    const socketService = new SocketService({ db, io: new SocketIoServer(server) });

    initTerminationHandler(server, socketService);

    server.listen(port, () => {
      serverLogger.info({ port }, 'Next.js server started to listen');
    });
  })
  .catch((err) => {
    serverLogger.error({ err }, 'Next.js server failed to start');
  });
