export interface UploadedMediaFile {
  path?: string;
  buffer?: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}
