// src/routes/comics.ts
import express from 'express';
import { comicController } from '../controllers/comics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequestBody } from '../middleware/validation.middleware';
import { checkPanelBalance } from '../middleware/billing.middleware';
import { CreateComicRequestSchema, GeneratePanelImageRequestSchema, API_ROUTES } from '@repo/common-types';

const router = express.Router();
const { COMICS } = API_ROUTES;

router.post(
    COMICS.GENERATE_PANEL_IMAGE,
    authenticateToken,
    checkPanelBalance,
    validateRequestBody(GeneratePanelImageRequestSchema),
    comicController.generateImage
);

router.post(
    COMICS.BASE,
    authenticateToken,
    validateRequestBody(CreateComicRequestSchema),
    comicController.saveComic
);

router.put(
    COMICS.BY_ID(':comicId'),
    authenticateToken,
    validateRequestBody(CreateComicRequestSchema),
    comicController.saveComic
);

router.get(
    COMICS.BASE,
    authenticateToken,
    comicController.listComics
);

router.get(
    COMICS.BY_ID(':comicId'),
    authenticateToken,
    comicController.getComic
);

router.delete(
    COMICS.BY_ID(':comicId'),
    authenticateToken,
    comicController.deleteComic
);

export default router; // Ensure this is exported correctly
