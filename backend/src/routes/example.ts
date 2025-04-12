// src/routes/example.ts
import express from 'express';
import pool from '../database'; // Import your database connection

const router = express.Router();

// Get all users from the database
router.get('/users', (req, res) => {
    pool.query('SELECT * FROM users')
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Error fetching users' });
        });
});

// Get user by ID
router.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(result.rows[0]);
        })
        .catch(error => {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Error fetching user' });
        });
});

export default router;