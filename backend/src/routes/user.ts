import express from 'express';
import pool from '../database';

const router = express.Router();

// Get user by ID
router.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id])
        .then((result: { rows: string | any[]; }) => {
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(result.rows[0]);
        })
        .catch((error: any) => {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Error fetching user' });
        });
});

export default router;