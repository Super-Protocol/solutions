import fs from 'fs';
import { serverConfig } from './config';

export interface FileOrDirectory {
  dir: string;
  fullPath: string;
}

export const findFileOrDirectory = async (
  fileName: string,
  folder: string,
  depth = 0,
): Promise<FileOrDirectory | undefined> => {
  if (depth > 2) {
    return;
  }

  const items = await fs.promises.readdir(folder, { withFileTypes: true });

  if (!items.find((fileOrDirectory) => fileOrDirectory.name === fileName)) {
    return (
      await Promise.all(
        items
          .filter((fileOrDirectory) => fileOrDirectory.isDirectory())
          .map((dir) => findFileOrDirectory(fileName, `${folder}/${dir.name}`, depth + 1)),
      )
    ).find(Boolean);
  }

  return { dir: folder, fullPath: `${folder}/${fileName}` };
};

export const findModelDir = async (folder: string, depth = 0): Promise<string | undefined> => {
  if (depth > 2) {
    return;
  }

  const items = await fs.promises.readdir(folder, { withFileTypes: true });
  const [files, directories] = items.reduce(
    (acc, item) => {
      if (item.isFile()) {
        acc[0].push(item);
      } else {
        acc[1].push(item);
      }
      return acc;
    },
    [[], []] as [fs.Dirent[], fs.Dirent[]],
  );

  const stats = await Promise.all(files.map((file) => fs.promises.stat(`${folder}/${file.name}`)));

  if (stats.some((stat) => stat.size > serverConfig.modelSizeThreshold)) {
    const pathSplitted = folder.split('/');
    if (pathSplitted.at(-1)?.startsWith('input-')) {
      return folder;
    } else {
      pathSplitted.pop();
      return pathSplitted.join('/');
    }
  }

  return (
    await Promise.all(
      directories.map((directory) => findModelDir(`${folder}/${directory.name}`, depth + 1)),
    )
  ).find(Boolean);
};
