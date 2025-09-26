import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { DEFAULT_PORTS } from '@repo/common-types';

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
  console.error('===========================================');
  console.error('FATAL ERROR: Missing required environment variables');
  console.error('===========================================');
  console.error('Missing variables:', missingEnvVars.join(', '));
  console.error('===========================================');
  console.error('Environment variable status:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ SET' : '❌ MISSING';
    const displayValue = value ? (varName.includes('KEY') || varName.includes('SECRET') ? '***HIDDEN***' : value) : 'undefined';
    console.error(`  ${varName}: ${status} (${displayValue})`);
  });
  console.error('===========================================');
  console.error('Please set the missing variables in your Railway deployment');
  console.error('===========================================');
  process.exit(1);
}

export const PORT = process.env.PORT || DEFAULT_PORTS.BACKEND;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const AWS_REGION = process.env.AWS_REGION!;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';
export const FRONTEND_URL = process.env.FRONTEND_URL!;

// Create S3 client with error handling
let s3Client: S3Client | null = null;
try {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  console.log('✅ S3 client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize S3 client:', error);
  console.error('❌ S3 features will not be available');
}

export { s3Client };