// src/controllers/comics.controller.ts
import { Request, Response } from 'express';
import { ComicService } from '../services/comics.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ComicController {
    private comicService: ComicService;

    constructor() {
        this.comicService = new ComicService();
        this.generateScript = this.generateScript.bind(this);
        this.generateImage = this.generateImage.bind(this);
        this.saveComic = this.saveComic.bind(this);
    }

    generateScript = async (req: Request, res: Response): Promise<void> => {
        try {
            const { prompt } = req.body;
            if (!prompt) throw new Error('Prompt is required.');
            const scriptPanel = await this.comicService.generateSinglePanelScript(prompt);
            if (!scriptPanel) throw new Error('Failed to parse generated panel content.');
            res.status(200).json(scriptPanel);
        } catch (error: any) { /* ... error handling ... */ res.status(500).json({ error: error.message }); }
    };
    generateImage = async (req: Request, res: Response): Promise<void> => {
        // ... your existing implementation ...
        try {
            const { panelDescription } = req.body;
            if (!panelDescription) throw new Error('panelDescription is required.');
            const panelImage = await this.comicService.generatePanelImage(panelDescription);
            res.status(200).json(panelImage);
        } catch (error: any) { /* ... error handling ... */ res.status(500).json({ error: error.message }); }
    };

    /**
     * Handles requests to save (create or update) a comic.
     */
    saveComic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const internalUserId = req.internalUserId;
            if (!internalUserId) {
                res.status(401).json({ error: 'Unauthorized: User ID not found in request.' });
                return;
            }

            const comicData = req.body;
            if (!comicData || !comicData.title || !comicData.pages) {
                res.status(400).json({ error: 'Invalid comic data: title and pages are required.' });
                return;
            }

            const { comicId } = req.params;

            console.log(`Controller: saveComic called by user ${internalUserId}. Existing comicId: ${comicId}`);

            const result = await this.comicService.saveComicWithPanels(
                internalUserId,
                comicData,
                comicId // Pass undefined if it's a new comic (POST)
            );

            const statusCode = comicId ? 200 : 201;
            res.status(statusCode).json(result);

        } catch (error: any) {
            console.error('Error in saveComic controller:', error.message);
            if (error.message === "User not found" || error.message === "Comic not found or user mismatch") {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(401).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: error.message || 'Failed to save comic.' });
            }
        }
    };
}

export const comicController = new ComicController();
