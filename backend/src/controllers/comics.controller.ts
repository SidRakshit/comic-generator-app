// src/controllers/comics.controller.ts
import { Request, Response } from 'express';
import { ComicService } from '../services/comics.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ComicController {
    private comicService: ComicService;

    constructor() {
        this.comicService = new ComicService();
        // Bind methods to ensure 'this' context is correct
        this.generateScript = this.generateScript.bind(this);
        this.generateImage = this.generateImage.bind(this);
        this.saveComic = this.saveComic.bind(this); // Bind the new method
    }

    // --- Existing Methods (generateScript, generateImage) ---
    // ... (Keep your existing methods here, unchanged) ...
    generateScript = async (req: Request, res: Response): Promise<void> => {
        // ... your existing implementation ...
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

    // --- New Method: Save/Update Comic ---
    /**
     * Handles requests to save (create or update) a comic.
     */
    saveComic = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            // 1. Get User ID from authenticated request
            // Adjust this based on how your authentication middleware provides the user ID
            const internalUserId = req.internalUserId;
            if (!internalUserId) {
                res.status(401).json({ error: 'Unauthorized: User ID not found in request.' });
                return;
            }

            // 2. Get Comic Data from request body
            const comicData = req.body; // Assuming the body matches ComicDataFromRequest structure
            if (!comicData || !comicData.title || !comicData.pages) {
                res.status(400).json({ error: 'Invalid comic data: title and pages are required.' });
                return;
            }

            // 3. Get existing Comic ID from route parameters (for updates)
            const { comicId } = req.params; // Will be undefined for POST requests

            console.log(`Controller: saveComic called by user ${internalUserId}. Existing comicId: ${comicId}`);

            // 4. Call the service method
            const result = await this.comicService.saveComicWithPanels(
                internalUserId,
                comicData,
                comicId // Pass undefined if it's a new comic (POST)
            );

            // 5. Send response
            // If creating (POST), typically return 201 Created
            // If updating (PUT), typically return 200 OK
            const statusCode = comicId ? 200 : 201;
            res.status(statusCode).json(result);

        } catch (error: any) {
            console.error('Error in saveComic controller:', error.message);
            // Handle specific errors if needed (e.g., User not found, Comic not found)
            if (error.message === "User not found" || error.message === "Comic not found or user mismatch") {
                res.status(404).json({ error: error.message });
            } else if (error.message.includes('Unauthorized')) {
                res.status(401).json({ error: error.message });
            }
            else {
                // Generic server error
                res.status(500).json({ error: error.message || 'Failed to save comic.' });
            }
        }
    };
}

// Export a single instance
export const comicController = new ComicController();
