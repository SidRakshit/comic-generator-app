// src/database/index.ts
import { Pool } from "pg";
import { DATABASE_URL } from '../config';
import { SERVER_TIMEOUTS } from '@repo/common-types';

// Create a connection pool with better configuration
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: SERVER_TIMEOUTS.DATABASE_IDLE_TIMEOUT, // Close idle clients after timeout
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection asynchronously without blocking startup
setTimeout(() => {
  pool
    .connect()
    .then((client: { release: () => void }) => {
      console.log("✅ Successfully connected to PostgreSQL");
      client.release();
    })
    .catch((err: { message: any }) => {
      console.error("❌ Error connecting to PostgreSQL:", err.message);
      console.error("❌ Database connection failed, but server will continue to start");
      console.error("❌ Database-dependent features may not work properly");
    });
}, 1000); // Delay by 1 second to let server start first

// Handle pool errors gracefully
pool.on('error', (err: any) => {
	console.error('❌ Unexpected error on idle client:', err);
});

export default pool;
