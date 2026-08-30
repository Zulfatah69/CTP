import * as Minio from 'minio';
import { env } from './env';

// Ponytail: Initializing minio client. 
// If minio is not running locally, operations will throw.
export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'ctp-documents';

// Ensure bucket exists on startup
export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully in MinIO.`);
    }
  } catch (error) {
    console.warn(`[WARNING] Failed to connect to MinIO. Document features may fail. Error: ${error}`);
  }
};
