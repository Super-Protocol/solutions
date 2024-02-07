export const getPlatform = (): string => {
  switch (process.platform) {
    case 'darwin':
      return 'Mac OS';
    case 'linux':
      return 'Linux';
    case 'win32':
      return 'Windows';
    default:
      return process.platform;
  }
};
