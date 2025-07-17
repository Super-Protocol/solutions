// src/server.ts

import { spawn } from 'child_process';
import * as fs from 'fs';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';

// ... (код terminationHandler и parentPort остается без изменений) ...

const run = async (): Promise<void> => {
  const serverConfig = getServerConfig();
  const logger = rootLogger.child({ module: 'server.js' });

  // Записываем TLS сертификаты
  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey, { mode: 0o600 });
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert, { mode: 0o600 });
  logger.info('TLS certificates created.');

  // 1. Запускаем Ollama в фоновом режиме
  logger.info('Starting Ollama serve...');
  const ollama = spawn('ollama', ['serve'], {
    // detach, чтобы процесс не умер вместе с родителем, если вдруг что
    detached: true,
    stdio: 'inherit', // Показываем логи Ollama в основном потоке
  });

  ollama.on('error', (err) => {
    logger.fatal({ err }, 'Failed to start Ollama.');
    process.exit(1);
  });
  
  // Даем Ollama пару секунд на запуск
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Ollama should be running.');

  // 2. Запускаем Open WebUI с HTTPS через uvicorn
  logger.info('Starting Open WebUI with uvicorn...');
  spawn('uvicorn', [
    'open_webui.main:app', // <-- ИЗМЕНЕНИЕ: Упрощаем имя модуля
    '--ssl-keyfile', serverConfig.privateKeyFilePath,
    '--ssl-certfile', serverConfig.certificateFilePath,
    '--host', '0.0.0.0',
    '--port', String(serverConfig.port),
    '--forwarded-allow-ips', '*',
  ], {
    stdio: 'inherit',
    // <-- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Указываем рабочую директорию!
    cwd: `${serverConfig.openWebUIPath}/backend`,
  });
};

run().catch((err) => {
  const logger = rootLogger.child({ module: 'server.js' });
  logger.fatal({ err }, `Open WebUI start command failed`);
});
