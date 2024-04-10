/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import colors from 'colors';
import { downloadSpctl } from './helpers/download-spctl';

async function main(): Promise<void> {
  const version = '0.8.8';
  const destination = path.join('tools', 'spctl');

  try {
    if (fs.existsSync(destination)) {
      console.log(colors.green('spctl is already downloaded'));
      return;
    }

    await downloadSpctl({ version, destination });
    console.log(colors.green('Done'));
  } catch (err) {
    console.error(colors.red('Failed to download:'), (err as Error).message);
    process.exit(1);
  }
}

void main();
