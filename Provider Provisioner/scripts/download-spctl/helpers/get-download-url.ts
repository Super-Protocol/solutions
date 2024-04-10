import { getOSAndArch } from './get-os-and-arch';

export const VERSION_MATCH = '{{version}}';
export const OS_MATCH = '{{os}}';
export const ARCH_MATCH = '{{arch}}';
export const REPO_MATCH = '{{repo}}';
export const TOOL_NAME_MATCH = '{{tool}}';
export const SPCTL_TOOL_REPO_NAME = 'ctl';
export const LATEST_RELEASE_URL_TEMPLATE = `https://api.github.com/repos/Super-Protocol/${REPO_MATCH}/releases/latest`;
export const REPO_DOWNLOAD_URL_TEMPLATE = `https://github.com/Super-Protocol/${REPO_MATCH}/releases/download/v${VERSION_MATCH}/${TOOL_NAME_MATCH}-${OS_MATCH}-${ARCH_MATCH}`;

export function getDownloadUrl(version: string): string {
  const osAndArch = getOSAndArch();

  return REPO_DOWNLOAD_URL_TEMPLATE.replace(REPO_MATCH, SPCTL_TOOL_REPO_NAME)
    .replace(VERSION_MATCH, version)
    .replace(TOOL_NAME_MATCH, 'spctl')
    .replace(OS_MATCH, osAndArch.platform)
    .replace(ARCH_MATCH, osAndArch.arch);
}

export const getLatestReleaseUrl = (): string =>
  LATEST_RELEASE_URL_TEMPLATE.replace(REPO_MATCH, SPCTL_TOOL_REPO_NAME);
