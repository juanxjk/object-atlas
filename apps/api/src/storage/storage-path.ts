import { isAbsolute, resolve } from 'node:path';

function getApiRootDirectory(): string {
  return resolve(__dirname, '..', '..');
}

export function resolveStorageRoot(configuredRoot?: string): string {
  if (!configuredRoot) {
    return resolve(getApiRootDirectory(), 'uploads');
  }

  if (isAbsolute(configuredRoot)) {
    return configuredRoot;
  }

  return resolve(getApiRootDirectory(), configuredRoot);
}
