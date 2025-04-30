// backend/src/config/index.ts
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

// Load environment variables from .env file at the earliest point
dotenv.config();

// --- Server Port ---
export const PORT = process.env.PORT || 8080;

// --- Database Configuration ---
export const DB_CONFIG = {
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT || "5432", 10),
	max: parseInt(process.env.DB_POOL_SIZE || "20", 10),
	idleTimeoutMillis: 30000,
};

// Basic validation for essential DB config
if (
	!DB_CONFIG.user ||
	!DB_CONFIG.host ||
	!DB_CONFIG.database ||
	!DB_CONFIG.password
) {
	console.warn(
		"Warning: One or more database configuration variables (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD) are missing."
	);
}

// --- AWS S3 / General AWS Configuration ---
export const AWS_REGION = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Validate essential AWS config variables needed for S3/Cognito
if (!AWS_REGION) {
	console.error("FATAL ERROR: AWS_REGION environment variable is not set.");
}
if (!awsAccessKeyId || !awsSecretAccessKey) {
	console.warn(
		"Warning: AWS S3 credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are incomplete. S3 functionality may be disabled."
	);
}

// Configure the AWS SDK S3 client
export const s3Client = new S3Client({
	region: AWS_REGION,
});

// Export the S3 Bucket Name
export const S3_BUCKET = process.env.S3_BUCKET_NAME;
if (!S3_BUCKET) {
	console.warn(
		"Warning: S3_BUCKET_NAME environment variable is missing. S3 uploads will likely fail."
	);
}

// --- AWS Cognito Configuration ---
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
if (!COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
	console.error(
		"FATAL ERROR: Cognito configuration (COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID) is missing."
	);
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
	console.warn("Warning: OPENAI_API_KEY environment variable is missing.");
}

console.log("Configuration loaded:");
console.log(`- Port: ${PORT}`);
console.log(`- DB Host: ${DB_CONFIG.host}`);
console.log(`- DB Name: ${DB_CONFIG.database}`);
console.log(`- AWS Region: ${AWS_REGION || "Not Set"}`);
console.log(`- S3 Bucket: ${S3_BUCKET || "Not Set"}`);
console.log(`- Cognito Pool ID: ${COGNITO_USER_POOL_ID || "Not Set"}`);
console.log(`- Cognito Client ID: ${COGNITO_CLIENT_ID || "Not Set"}`);
