// src/routes/comics.ts
import express from 'express';
import { comicController } from '../controllers/comics.controller';

const router = express.Router();

// Add a simple test route that doesn't use the controller
router.get('/simple-test', (req, res) => {
    console.log('Simple test route accessed!');
    res.json({ message: 'Simple comics test route works!' });
});

// Then add the controller-based routes
router.post('/generate', comicController.generateComic);
router.get('/test', (req, res) => {
    res.json({ message: 'Comics route is working!' });
});

export default router;