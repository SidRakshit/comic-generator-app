// src/controllers/comics.controller.ts
import { Request, Response } from 'express';
import { ComicService } from '../services/comics.service';

export class ComicController {
    private comicService: ComicService;

    constructor() {
        this.comicService = new ComicService();
    }

    // Remove the Promise<void> return type or change it to match what you're returning
    generateComic = async (req: Request, res: Response) => {
        try {
            const { prompt, panelCount = 3 } = req.body;

            if (!prompt) {
                res.status(400).json({ error: 'Prompt is required' });
                return; // Use return without a value
            }

            const comic = await this.comicService.generateComic(prompt, panelCount);
            res.json(comic);
        } catch (error) {
            console.error('Error generating comic:', error);
            res.status(500).json({ error: 'Failed to generate comic' });
        }
    }
}

export const comicController = new ComicController();