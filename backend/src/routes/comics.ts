// src/routes/comics.ts
import express from 'express';
import { comicController } from '../controllers/comics.controller';
// Import your authentication middleware (replace with your actual middleware)
import { authenticateToken } from '../middleware/auth.middleware'; // Example middleware

const router = express.Router();

// --- Generation Routes (Public or Authenticated?) ---
// Decide if these need authentication or not
router.post('/generate-script',
    authenticateToken,
    comicController.generateScript);
router.post('/generate-panel-image',
    authenticateToken,
    comicController.generateImage);

// --- Test Routes ---
router.get('/simple-test', (req, res) => {
    console.log('Simple test route accessed!');
    res.json({ message: 'Simple comics test route works!' });
});
router.get('/test', (req, res) => {
    res.json({ message: 'Comics route is working!' });
});

// --- Comic CRUD Routes (Require Authentication) ---

// POST /api/comics - Create a new comic
// Applies authentication middleware first
router.post(
    '/comics',
    authenticateToken, // Apply your authentication middleware here
    comicController.saveComic
);

// PUT /api/comics/:comicId - Update an existing comic
// Applies authentication middleware first
router.put(
    '/comics/:comicId',
    authenticateToken, // Apply your authentication middleware here
    comicController.saveComic
);

// GET /api/comics - Get list of user's comics (Add controller method + service logic)
// router.get('/comics', authenticateToken, comicController.listComics);

// GET /api/comics/:comicId - Get a specific comic (Add controller method + service logic)
// router.get('/comics/:comicId', authenticateToken, comicController.getComic);

// DELETE /api/comics/:comicId - Delete a comic (Add controller method + service logic)
// router.delete('/comics/:comicId', authenticateToken, comicController.deleteComic);


export default router; // Ensure this is exported correctly

