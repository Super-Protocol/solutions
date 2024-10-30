import fs, { constants } from 'fs';
import { EngineConfiguration } from './types';

export const fileExists = (filePath: string): Promise<boolean> =>
  fs.promises
    .access(filePath, constants.F_OK)
    .then(() => true)
    .catch(() => false);

export interface FindModelResult {
  folder: string;
  model: string;
}

export const findModel = async (
  folder: string,
  modelSizeThreshold: number,
  modelName?: string,
  depth = 0,
): Promise<FindModelResult | undefined> => {
  if (depth > 2) {
    return;
  }
  const items = await fs.promises.readdir(folder, { withFileTypes: true });

  if (modelName) {
    if (!items.find((fileOrDirectory) => fileOrDirectory.name === modelName)) {
      return (
        await Promise.all(
          items
            .filter((fileOrDirectory) => fileOrDirectory.isDirectory())
            .map((dir) =>
              findModel(`${folder}/${dir.name}`, modelSizeThreshold, modelName, depth + 1),
            ),
        )
      ).find(Boolean);
    }

    return { folder, model: modelName };
  }

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

  const fileStats = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      stat: await fs.promises.stat(`${folder}/${file.name}`),
    })),
  );

  const potentialModelFile = fileStats.find((fileStat) => fileStat.stat.size > modelSizeThreshold);

  if (potentialModelFile) {
    const pathSplitted = folder.split('/');
    if (pathSplitted.at(-1)?.startsWith('input-')) {
      return {
        folder,
        model: potentialModelFile.fileName,
      };
    } else {
      const model = pathSplitted.pop() as string;
      return {
        folder: pathSplitted.join('/'),
        model,
      };
    }
  }

  return (
    await Promise.all(
      directories.map((directory) =>
        findModel(`${folder}/${directory.name}`, modelSizeThreshold, modelName, depth + 1),
      ),
    )
  ).find(Boolean);
};

export const setupCharacter = async (
  character: EngineConfiguration['main_settings']['character'],
  engineFolder: string,
): Promise<string> => {
  const normalizeData = (str: string): string => str?.replace(/\n/g, '');

  const namePlaceholder = `{{{name}}}`;
  const greetingPlaceholder = `{{{greeting}}}`;
  const defaultGreeting = `Hello! How can I help you today?`;
  const contextPlaceholder = `{{{context}}}`;
  const defaultContext = `The following is a conversation with an AI Large Language Model. The AI has been trained to answer questions, provide recommendations, and help with decision making. The AI follows user requests. The AI thinks outside the box.`;
  const template = `name: ${namePlaceholder}
greeting: |-
  ${greetingPlaceholder}
context: |-
  ${contextPlaceholder}
  `;
  const characterName = normalizeData(character.name);
  const characterFileName = characterName.replace(/\s/g, '');

  const characterFile = template
    .replace(namePlaceholder, characterName)
    .replace(greetingPlaceholder, normalizeData(character.greeting) || defaultGreeting)
    .replace(contextPlaceholder, normalizeData(character.context) || defaultContext);

  await fs.promises.writeFile(
    `${engineFolder}/characters/${characterFileName}.yaml`,
    characterFile,
  );

  return characterFileName;
};
