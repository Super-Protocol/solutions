/**
 * ModelDetector.ts
 *
 * A utility class for detecting AI model files in a folder structure.
 * Identifies whether models require directory-based storage or can be represented as single files.
 */

import * as fs from 'fs';
import * as path from 'path';
import { rootLogger } from '../logger';

const logger = rootLogger.child({ module: 'ModelDetector' });

export interface FindModelResult {
  folder: string;
  model: string;
}

export class ModelDetector {
  // Files that indicate a model requires a directory
  private static readonly DIRECTORY_INDICATOR_FILES: Set<string> = new Set([
    'config.json',
    'tokenizer.json',
    'vocab.json',
    'merges.txt',
    'spiece.model',
    'vocab.txt',
    'tokenizer_config.json',
    'special_tokens_map.json',
    'generation_config.json',
    'preprocessor.json',
    'processor.json',
    'feature_extractor.json',
  ]);

  // File extensions for standalone model files
  private static readonly STANDALONE_MODEL_EXTENSIONS: Set<string> = new Set([
    '.gguf',
    '.ggml',
    '.tflite',
    '.h5',
    '.ot',
  ]);

  private static isPotentialModelFile(filePath: string): boolean {
    // Check if it's a known single file model by extension
    const ext = path.extname(filePath).toLowerCase();
    if (this.STANDALONE_MODEL_EXTENSIONS.has(ext)) {
      return true;
    }

    // Check other common model file extensions
    const otherModelExts = ['.bin', '.model', '.pt', '.pth', '.pb', '.onnx', '.weights'];
    return otherModelExts.includes(ext);
  }

  private static splitToModelAndPath(foundPath: string): FindModelResult {
    return {
      folder: path.dirname(foundPath),
      model: path.basename(foundPath),
    };
  }

  public static detectModelPath(
    folderPath: string,
    modelName?: string,
  ): FindModelResult | undefined {
    logger.info(
      `Searching for models in folder: ${folderPath}${modelName ? ` with specific model path: ${modelName}` : ''}`,
    );

    try {
      // If a specific model path is provided, check if it exists
      if (modelName) {
        const fullModelPath = path.join(folderPath, modelName);

        if (fs.existsSync(fullModelPath)) {
          const stat = fs.statSync(fullModelPath);

          if (stat.isDirectory()) {
            logger.info(`Found specified directory model at: ${fullModelPath}`);
            return this.splitToModelAndPath(fullModelPath);
          } else if (this.isPotentialModelFile(fullModelPath)) {
            logger.info(`Found specified file model at: ${fullModelPath}`);
            return this.splitToModelAndPath(fullModelPath);
          } else {
            logger.warn(
              `Specified path exists but does not appear to be a valid model: ${fullModelPath}`,
            );
          }
        } else {
          logger.warn(`Specified model path does not exist: ${fullModelPath}`);
        }

        // If the specified model was not found, return undefined
        return undefined;
      }

      // Get all files in the folder and subfolders
      const allFiles: string[] = [];

      const getAllFiles = (dir: string): void => {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            getAllFiles(filePath);
          } else {
            // Store relative paths for consistency
            const relativePath = path.relative(folderPath, filePath);
            allFiles.push(relativePath);
          }
        });
      };

      getAllFiles(folderPath);

      // First, check for directory models by looking for indicator files
      const potentialDirectoryModels: Set<string> = new Set();

      for (const filePath of allFiles) {
        const fileName = path.basename(filePath);
        if (this.DIRECTORY_INDICATOR_FILES.has(fileName)) {
          const modelDir = path.dirname(filePath);
          potentialDirectoryModels.add(modelDir);
          logger.info(`Found potential directory model at: ${modelDir} (indicated by ${fileName})`);
        }
      }

      // If we found any directory models, return the path to the first one
      if (potentialDirectoryModels.size > 0) {
        const modelDir = Array.from(potentialDirectoryModels)[0];
        const fullPath = path.join(folderPath, modelDir);
        logger.info(`Selected directory model: ${fullPath}`);
        return this.splitToModelAndPath(fullPath);
      }

      // If no directory models, look for single file models
      const singleFileModels: string[] = [];

      for (const filePath of allFiles) {
        if (this.isPotentialModelFile(filePath)) {
          singleFileModels.push(filePath);
          logger.info(`Found potential single-file model: ${filePath}`);
        }
      }

      if (singleFileModels.length > 0) {
        const modelFile = singleFileModels[0];
        const fullPath = path.join(folderPath, modelFile);
        logger.info(`Selected single-file model: ${fullPath}`);
        return this.splitToModelAndPath(fullPath);
      }

      // If no models found
      logger.info('No models found in the folder');

      return undefined;
    } catch (error) {
      logger.error(`Error detecting models: ${error}`);
      return undefined;
    }
  }
}
