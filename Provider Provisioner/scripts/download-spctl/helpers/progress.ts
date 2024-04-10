import { MultiBar, SingleBar } from 'cli-progress';
import colors from 'colors';

const multiBar = new MultiBar({
  format: `{title} | ${colors.white('{bar}')} | {percentage}% | ETA: {eta}s | {value}/{total}`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

const progressBarMap: Map<string, SingleBar> = new Map();

const getProgressBar = (title: string, total: number): SingleBar => {
  let progressBar = progressBarMap.get(title);
  if (!progressBar) {
    progressBar = multiBar.create(total, 0);
    progressBar.start(total, 0);
    progressBarMap.set(title, progressBar);
  }

  return progressBar;
};

export const start = (title: string, total: number, current: number): void =>
  getProgressBar(title, total).update(current, { title: title });

export const stop = (): void => {
  multiBar.stop();
  progressBarMap.clear();
};
