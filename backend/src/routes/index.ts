// backend/src/routes/index.ts

import express from 'express';
import comicRoutes from './comics'; // Your existing comic routes
import userRoutes from './user';
// Import other route files as needed (e.g., userRoutes)

const router = express.Router();

// Mount the comic routes under /api (or directly if preferred)
router.use('/', comicRoutes);
router.use('/', userRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'API is running!' });
});


export default router;
