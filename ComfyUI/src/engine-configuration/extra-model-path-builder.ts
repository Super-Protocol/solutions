import path from 'path';

export type ModelTypes = 'checkpoints'; // 'checkpoints' | 'clip' | 'clip_vision' | 'configs' | 'controlnet' | 'embeddings' | 'loras' | 'upscale_models' | 'vae'

export class ExtraModelPathBuilder {
  private modelPath: Record<string, string[]> = {};

  setModelPath(type: ModelTypes, path: string): ExtraModelPathBuilder {
    if (!this.modelPath[type]?.length) {
      this.modelPath[type] = [path];
    } else if (!this.modelPath[type].includes(path)) {
      this.modelPath[type].push(path);
    }

    return this;
  }

  build(): string {
    if (!Object.keys(this.modelPath).length) {
      throw new Error('No data in ExtraModelPathBuilder. Set smth before build');
    }

    const allPaths = Object.values(this.modelPath).flat();
    const basePath = this.getCommonPath(allPaths);
    let value = `comfyui:\n${this.setNestedLevel(1)}base_path: ${basePath}/`;

    Object.keys(this.modelPath).forEach((key) => {
      value +=
        `\n${this.setNestedLevel(1)}${key}: |\n` +
        this.modelPath[key]
          .map(
            (modelFolderPath) =>
              `${this.setNestedLevel(2)}${path.relative(basePath, modelFolderPath)}/`,
          )
          .join('\n');
    });

    this.modelPath = {};

    return value;
  }

  private getCommonPath(paths: string[]): string {
    if (!paths.length) {
      throw new Error(`ExtraModelPathBuilder: paths are empty`);
    }

    if (paths.length === 1) {
      return path.sep;
    }

    const normalizedPaths = paths.map((p) => path.normalize(p));

    const splitPaths = normalizedPaths.map((p) => p.split(path.sep));

    const commonParts = [];
    for (let i = 0; i < splitPaths[0].length; i++) {
      const part = splitPaths[0][i];
      if (splitPaths.every((p) => p[i] === part)) {
        commonParts.push(part);
      } else {
        break;
      }
    }

    return commonParts.length > 1 ? commonParts.join(path.sep) : path.sep;
  }

  private setNestedLevel(level: number = 0): string {
    return `${'  '.repeat(level)}`;
  }
}
