// src/routes/comics.ts
import express from 'express';
import { comicController } from '../controllers/comics.controller';

const router = express.Router();

router.post('/generate-script', comicController.generateScript);

router.post('/generate-panel-image', comicController.generateImage);

router.get('/simple-test', (req, res) => {
    console.log('Simple test route accessed!');
    res.json({ message: 'Simple comics test route works!' });
});

router.get('/test', (req, res) => {
    res.json({ message: 'Comics route is working!' });
});

export default router;