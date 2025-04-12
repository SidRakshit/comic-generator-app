// src/routes/example.ts
import express from 'express';
import pool from '../database'; // Import your database connection

const router = express.Router();

// Get all users from the database
router.get('/users', (req, res) => {
    pool.query('SELECT * FROM users')
        .then((result: { rows: any; }) => {
            res.json(result.rows);
        })
        .catch((error: any) => {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Error fetching users' });
        });
});

export default router;