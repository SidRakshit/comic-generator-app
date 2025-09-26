import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { DEFAULT_PORTS, ENV_VARS, AI_CONFIG } from '@repo/common-types';

// Use centralized environment variable names
const requiredEnvVars = [
  ENV_VARS.DATABASE_URL,
  ENV_VARS.AWS_REGION,
  ENV_VARS.AWS_ACCESS_KEY_ID,
  ENV_VARS.AWS_SECRET_ACCESS_KEY,
  ENV_VARS.S3_BUCKET_NAME,
  ENV_VARS.COGNITO_USER_POOL_ID,
  ENV_VARS.COGNITO_CLIENT_ID,
  ENV_VARS.OPENAI_API_KEY,
  ENV_VARS.FRONTEND_URL,
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

// Use centralized environment variable names for all exports
export const PORT = process.env[ENV_VARS.PORT] || DEFAULT_PORTS.BACKEND;
export const DATABASE_URL = process.env[ENV_VARS.DATABASE_URL]!;
export const AWS_REGION = process.env[ENV_VARS.AWS_REGION]!;
export const S3_BUCKET_NAME = process.env[ENV_VARS.S3_BUCKET_NAME]!;
export const COGNITO_USER_POOL_ID = process.env[ENV_VARS.COGNITO_USER_POOL_ID]!;
export const COGNITO_CLIENT_ID = process.env[ENV_VARS.COGNITO_CLIENT_ID]!;
export const OPENAI_API_KEY = process.env[ENV_VARS.OPENAI_API_KEY]!;
export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || AI_CONFIG.OPENAI.MODELS.CHAT;
export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || AI_CONFIG.OPENAI.MODELS.IMAGE;
export const FRONTEND_URL = process.env[ENV_VARS.FRONTEND_URL]!;

// Create S3 client with error handling
let s3Client: S3Client | null = null;
try {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env[ENV_VARS.AWS_ACCESS_KEY_ID]!,
      secretAccessKey: process.env[ENV_VARS.AWS_SECRET_ACCESS_KEY]!,
    },
  });
  console.log('✅ S3 client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize S3 client:', error);
  console.error('❌ S3 features will not be available');
}

export { s3Client };