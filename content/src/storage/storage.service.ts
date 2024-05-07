export abstract class StorageService {
  abstract uploadObject(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
  ): Promise<void>;

  abstract getObject(bucketName: string, objectName: string): Promise<Buffer>;

  abstract deleteObject(bucketName: string, objectName: string): Promise<void>;
}
