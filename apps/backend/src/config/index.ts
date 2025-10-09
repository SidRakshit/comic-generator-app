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
  ENV_VARS.GEMINI_API_KEY,
  ENV_VARS.IMAGE_GENERATION_PROVIDER,
  ENV_VARS.FRONTEND_URL,
  ENV_VARS.STRIPE_SECRET_KEY,
  ENV_VARS.STRIPE_WEBHOOK_SECRET,
  ENV_VARS.ADMIN_IMPERSONATION_SECRET,
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
export const GEMINI_API_KEY = process.env[ENV_VARS.GEMINI_API_KEY]!;
export const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || AI_CONFIG.GEMINI.MODELS.IMAGE;
export const IMAGE_GENERATION_PROVIDER = process.env[ENV_VARS.IMAGE_GENERATION_PROVIDER] || 'gemini'; // Default to 'gemini', can be 'openai' or 'gemini'
export const FRONTEND_URL = process.env[ENV_VARS.FRONTEND_URL]!;
export const STRIPE_SECRET_KEY = process.env[ENV_VARS.STRIPE_SECRET_KEY]!;
export const STRIPE_WEBHOOK_SECRET = process.env[ENV_VARS.STRIPE_WEBHOOK_SECRET]!;
export const STRIPE_SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || `${FRONTEND_URL.replace(/\/$/, "")}/billing/success`;
export const STRIPE_CANCEL_URL = process.env.STRIPE_CANCEL_URL || `${FRONTEND_URL.replace(/\/$/, "")}/billing/cancel`;
export const ADMIN_SERVICE_TOKEN = process.env.ADMIN_SERVICE_TOKEN || "";
export const ADMIN_SERVICE_USER_ID = process.env.ADMIN_SERVICE_USER_ID || null;
export const ADMIN_SERVICE_TOKEN_HASH = process.env.ADMIN_SERVICE_TOKEN_HASH || "";
export const ADMIN_IMPERSONATION_SECRET = process.env.ADMIN_IMPERSONATION_SECRET!;

if (!ADMIN_SERVICE_TOKEN && !ADMIN_SERVICE_TOKEN_HASH) {
  console.warn('[WARN] ADMIN_SERVICE_TOKEN or ADMIN_SERVICE_TOKEN_HASH is not configured. Admin service calls will be rejected.');
}

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
