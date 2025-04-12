// src/database/index.ts
import { Pool } from 'pg';
import { DB_CONFIG } from '../config';

// Create a connection pool
const pool = new Pool(DB_CONFIG);

// Test the connection
pool.connect()
    .then(client => {
        console.log('Successfully connected to PostgreSQL');
        client.release();
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL:', err.message);
    });

export default pool;