// src/routes/comics.ts
import express from 'express';
import { comicController } from '../controllers/comics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/generate-script',
    authenticateToken,
    comicController.generateScript);
router.post('/generate-panel-image',
    authenticateToken,
    comicController.generateImage);

router.post(
    '/comics',
    authenticateToken,
    comicController.saveComic
);

router.put(
    '/comics/:comicId',
    authenticateToken,
    comicController.saveComic
);

router.get(
    '/comics',
    authenticateToken,
    comicController.listComics
);

router.get(
    '/comics/:comicId',
    authenticateToken,
    comicController.getComic
);

// DELETE /api/comics/:comicId - Delete a comic (Add controller method + service logic)
// router.delete('/comics/:comicId', authenticateToken, comicController.deleteComic);


export default router; // Ensure this is exported correctly
