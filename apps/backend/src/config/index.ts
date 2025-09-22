import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

const requiredEnvVars = [
  'DATABASE_URL',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
  'OPENAI_API_KEY',
  'FRONTEND_URL',
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(
    `FATAL ERROR: The following required environment variables are missing: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

export const PORT = process.env.PORT || '8080';
export const DATABASE_URL = process.env.DATABASE_URL!;
export const AWS_REGION = process.env.AWS_REGION!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const FRONTEND_URL = process.env.FRONTEND_URL!;

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});