// src/controllers/comics.controller.ts
import { Request, Response } from 'express';
import { ComicService } from '../services/comics.service';

export class ComicController {
    private comicService: ComicService;

    constructor() {
        this.comicService = new ComicService();
    }

    generateScript = async (req: Request, res: Response): Promise<void> => {
        try {
            const { prompt } = req.body;
<<<<<<< HEAD
            if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
                res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
                return;
            }
            const scriptPanel = await this.comicService.generateSinglePanelScript(prompt);
=======
>>>>>>> refs/remotes/origin/main

            if (!scriptPanel) {
                throw new Error('Failed to parse generated panel content.');
            }

<<<<<<< HEAD
            res.status(200).json(scriptPanel);

        } catch (error: any) {
            console.error('Error in generateScript controller:', error.message);
            if (error.message.includes('OpenAI API key')) {
                res.status(500).json({ error: 'Server configuration error regarding API key.' });
            } else {
                res.status(500).json({ error: error.message || 'Failed to generate panel script.' });
            }
=======
            const comic = await this.comicService.generateComic(prompt);
            res.json(comic);
        } catch (error) {
            console.error('Error generating comic:', error);
            res.status(500).json({ error: 'Failed to generate comic' });
>>>>>>> refs/remotes/origin/main
        }
    };

    generateImage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { panelDescription } = req.body;
            if (!panelDescription || typeof panelDescription !== 'string' || panelDescription.trim() === '') {
                res.status(400).json({ error: 'panelDescription is required and must be a non-empty string.' });
                return;
            }
            const panelImage = await this.comicService.generatePanelImage(panelDescription);
            res.status(200).json(panelImage);
        } catch (error: any) {
            console.error('Error in generateImage controller:', error.message);
            if (error.message.includes('OpenAI API key')) {
                res.status(500).json({ error: 'Server configuration error regarding API key.' });
            } else if (error.message.includes('content policy violation')) {
                res.status(400).json({ error: 'Image generation failed due to content policy violation.' });
            }
            else {
                res.status(500).json({ error: error.message || 'Failed to generate panel image.' });
            }
        }
    };
}

export const comicController = new ComicController();