// backend/src/routes/index.ts

import express from 'express';
import comicRoutes from './comics'; // Your existing comic routes
import authRoutes from './auth';   // Import the new auth routes
// Import other route files as needed (e.g., userRoutes)

const router = express.Router();

// Mount the authentication routes under /api/auth
router.use('/auth', authRoutes);

// Mount the comic routes under /api (or directly if preferred)
router.use('/', comicRoutes); // Or router.use('/comics', comicRoutes);

// Add other routes...
// router.use('/users', userRoutes);

// Simple health check or root route
router.get('/', (req, res) => {
    res.json({ message: 'API is running!' });
});


export default router;
