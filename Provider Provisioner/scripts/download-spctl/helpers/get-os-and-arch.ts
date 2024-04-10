const supportedPlatform: NodeJS.Platform[] = ['darwin', 'linux', 'win32'];
const supportedArch = ['arm64', 'x64'];

export function getOSAndArch(): { platform: string; arch: string } {
  const platform = process.platform;
  if (!supportedPlatform.includes(platform)) {
    throw new Error(`Unsupported OS: ${platform}`);
  }

  const arch = process.arch;
  if (!supportedArch.includes(arch)) {
    throw new Error(`Unsupported arch: ${arch}`);
  }

  return {
    platform: platform === 'darwin' ? 'macos' : platform,
    arch,
  };
}
