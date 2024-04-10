import path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as Progress from './progress';
import { getDownloadUrl } from './get-download-url';

interface DownloadSpctlParams {
  version: string;
  destination: string;
}

export async function downloadSpctl({ version, destination }: DownloadSpctlParams): Promise<void> {
  const downloadingProgressTitle = 'Downloading spctl';
  const url = getDownloadUrl(version);

  const folderPath = path.dirname(destination);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const file = fs.createWriteStream(destination);

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const fileSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;
    Progress.start(downloadingProgressTitle, fileSize, downloadedSize);

    response.data.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;
      Progress.start(downloadingProgressTitle, fileSize, downloadedSize);
    });
    response.data.pipe(file);

    return new Promise((resolve, reject): void => {
      file
        .on('finish', () => {
          file.close();
          Progress.stop();
          fs.chmodSync(destination, 0o755);

          resolve();
        })
        .on('error', reject);
    });
  } catch (err) {
    file.close();
    fs.unlink(destination, (err: unknown) => {
      if (err) {
        throw Error(`Failed to delete ${destination}`);
      }
    });
    throw err;
  }
}
