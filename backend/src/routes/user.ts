import express from 'express';
import pool from '../database';

const router = express.Router();

// Get user by ID
// router.get('/users/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         res.json(result.rows[0]);
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         res.status(500).json({ error: 'Error fetching user' });
//     }
// });

export default router;