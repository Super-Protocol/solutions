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
    `${engineFolder}/user_data/characters/${characterFileName}.yaml`,
    characterFile,
  );

  return characterFileName;
};
