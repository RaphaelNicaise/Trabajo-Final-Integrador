import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'platform-bucket';
export const INTERNAL_ENDPOINT = process.env.S3_INTERNAL_ENDPOINT || 'http://minio:9000'; 
export const PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
  },
  endpoint: INTERNAL_ENDPOINT,
  forcePathStyle: true,
});