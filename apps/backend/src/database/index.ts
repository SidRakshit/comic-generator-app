// src/database/index.ts
import { Pool } from "pg";
import { DATABASE_URL } from '../config';

// Create a connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
});

pool
	.connect()
	.then((client: { release: () => void }) => {
		console.log("Successfully connected to PostgreSQL");
		client.release();
	})
	.catch((err: { message: any }) => {
		console.error("Error connecting to PostgreSQL:", err.message);
	});

export default pool;
