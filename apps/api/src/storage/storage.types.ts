export type StoreFileInput = {
  objectId: string;
  originalFilename: string;
  mimeType: string;
  buffer: Buffer;
};

export type StoredFile = {
  diskPath: string;
  relativePath: string;
  filename: string;
  mimeType: string;
  size: number;
};

export interface StorageService {
  store(input: StoreFileInput): Promise<StoredFile>;
  delete(relativePath: string): Promise<void>;
  resolvePath(relativePath: string): string;
}
