/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import colors from 'colors';
import axios from 'axios';
import semver from 'semver';
import { downloadSpctl } from './helpers/download-spctl';
import { getLatestReleaseUrl } from './helpers/get-download-url';

async function main(): Promise<void> {
  const destination = path.join('tools', 'spctl');

  try {
    if (fs.existsSync(destination)) {
      console.log(colors.green('spctl is already downloaded'));
      return;
    }

    const latestReleaseUrl = getLatestReleaseUrl();
    const response = await axios.get(latestReleaseUrl);
    const latestVersion = semver.clean(response.data.tag_name);

    await downloadSpctl({ version: latestVersion, destination });
    console.log(colors.green('Done'));
  } catch (err) {
    console.error(colors.red('Failed to download:'), (err as Error).message);
    process.exit(1);
  }
}

void main();
