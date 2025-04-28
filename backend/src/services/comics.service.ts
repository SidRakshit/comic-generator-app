// backend/src/services/comics.service.ts

// --- Core Dependencies ---
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from 'axios';
import crypto from 'crypto';
import { Pool, PoolClient } from 'pg';

// --- Configuration Import ---
import { s3Client, S3_BUCKET, OPENAI_API_KEY } from '../config';

// --- Database Pool Import ---
import pool from '../database';

// --- Interfaces (Keep existing interfaces: Dialogue, ScriptPanel, PanelImage) ---
export interface Dialogue { character: string; text: string; }
export interface ScriptPanel { panelNumber: string; description: string; dialogue: Dialogue[]; }
export interface PanelImage { imageUrl: string; }

// Interfaces for the data structure expected when saving a comic
interface PanelDataFromRequest {
    panelNumber: number;
    prompt: string;
    dialogue?: string;
    layoutPosition: object;
    generatedImageUrl: string;
}
interface PageDataFromRequest {
    pageNumber: number;
    panels: PanelDataFromRequest[];
}
interface ComicDataFromRequest {
    title: string;
    description?: string;
    characters?: object[];
    setting?: object;
    pages: PageDataFromRequest[];
}

// --- Comic Service Class ---
export class ComicService {

    // --- OpenAI Interaction Methods ---

    /**
     * Generates the script (panel description and dialogue) for a SINGLE panel.
     * @param prompt The user's prompt describing the desired panel content.
     * @returns A promise that resolves to a ScriptPanel object or null.
     */
    async generateSinglePanelScript(prompt: string): Promise<ScriptPanel | null> {
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured.');
        }
        if (!prompt || prompt.trim() === '') {
            throw new Error('Prompt cannot be empty.');
        }
        console.log(`Generating script for single panel prompt: "${prompt}"`);
        try {
            // *** Restored OpenAI API call for script generation ***
            const storyResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4', // Consider using a newer model if available/needed
                    messages: [
                        {
                            role: 'system',
                            content: `You are a comic writer. Describe a single comic panel based on the user's prompt. Provide a scene description and any character dialogue. Format clearly. Example:\nDescription: [Scene description]\nCHARACTER: "Dialogue"\nCHARACTER 2: "Dialogue"`
                        },
                        {
                            role: 'user',
                            content: `Generate a single comic panel description and dialogue for: ${prompt}`
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const panelContent = storyResponse.data.choices[0]?.message?.content;
            if (!panelContent) {
                throw new Error('Failed to get panel content from OpenAI response.');
            }
            console.log("Raw panel content received:", panelContent);
            const panels = this.parseComicScript(`Panel 1: ${panelContent}`); // Use internal parser
            console.log("Parsed single panel:", panels);
            return panels.length > 0 ? panels[0] : null;
        } catch (error: any) {
            // *** Restored Error Handling ***
            console.error('Error calling OpenAI for single panel script generation:', error.response?.data || error.message);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('OpenAI API key is invalid or expired.');
            }
            throw new Error('Failed to generate panel script from OpenAI.');
        }
    }

    /**
     * Generates an image URL for a given panel description using OpenAI.
     * @param panelDescription Text description of the panel scene.
     * @returns A promise that resolves to a PanelImage object containing the temporary image URL.
     */
    async generatePanelImage(panelDescription: string): Promise<PanelImage> {
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured.');
        }
        if (!panelDescription || panelDescription.trim() === '') {
            throw new Error('Panel description cannot be empty.');
        }
        console.log(`Generating image for description: "${panelDescription}"`);
        try {
            // *** Restored OpenAI API call for image generation ***
            const imageResponse = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    // Consider using DALL-E 3 if available via API
                    prompt: `Comic book panel illustration: ${panelDescription}. Style: vibrant, detailed.`,
                    n: 1,
                    size: '512x512' // Or '1024x1024' etc.
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const imageUrl = imageResponse.data.data[0]?.url;
            if (!imageUrl) {
                throw new Error('Failed to get image URL from OpenAI response.');
            }
            console.log("Image URL received:", imageUrl);
            return { imageUrl }; // Returns the temporary URL
        } catch (error: any) {
            // *** Restored Error Handling ***
            console.error('Error calling OpenAI for image generation:', error.response?.data || error.message);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('OpenAI API key is invalid or expired.');
            } else if (axios.isAxiosError(error) && error.response?.data?.error?.code === 'content_policy_violation') {
                throw new Error('Image generation failed due to content policy violation.');
            }
            throw new Error('Failed to generate panel image from OpenAI.');
        }
    }


    // --- S3 Upload Helper Method ---
    private async uploadImageToS3(
        tempImageUrl: string,
        userId: string,
        comicId: string,
        panelId: string
    ): Promise<string> {
        const awsRegion = process.env.AWS_REGION;
        if (!S3_BUCKET || !awsRegion) {
            console.error("S3 configuration (Bucket Name or Region) is missing.");
            throw new Error("S3 configuration is incomplete, cannot upload image.");
        }
        try {
            console.log(`Downloading image from: ${tempImageUrl}`);
            const response = await axios.get(tempImageUrl, { responseType: 'arraybuffer' });
            if (response.status !== 200) {
                throw new Error(`Failed to download image. Status: ${response.status}`);
            }

            const imageData: Buffer = response.data;
            let contentType = response.headers['content-type'] || 'application/octet-stream';
            let fileExtension = 'bin';
            if (contentType.startsWith('image/')) {
                fileExtension = contentType.split('/')[1].split('+')[0];
            } else {
                console.warn(`Unexpected content type "${contentType}", using default extension.`);
                contentType = 'application/octet-stream';
            }

            const s3Key = `users/${userId}/comics/${comicId}/panels/${panelId}.${fileExtension}`;
            console.log(`Uploading image to S3 bucket: ${S3_BUCKET}, Key: ${s3Key}`);

            const putObjectParams = { Bucket: S3_BUCKET, Key: s3Key, Body: imageData, ContentType: contentType };
            const command = new PutObjectCommand(putObjectParams);
            await s3Client.send(command);

            const s3Url = `https://${S3_BUCKET}.s3.${awsRegion}.amazonaws.com/${s3Key}`;
            console.log(`Successfully uploaded image to: ${s3Url}`);
            return s3Url;
        } catch (error: any) {
            console.error("Error in uploadImageToS3:", error);
            if (axios.isAxiosError(error)) { throw new Error(`Failed to download image from temp URL: ${error.message}`); }
            else if (error.name?.includes('Credentials') || error.message?.includes('credentials')) { throw new Error(`AWS Credentials error: ${error.message}`); }
            throw new Error(`Failed to process image upload: ${error.message}`);
        }
    }

    // --- Database Saving Method ---
    /**
     * Saves or updates a comic, handling panel image uploads to S3 and DB operations using pg Pool.
     * @param userId - The ID (UUID) of the user creating/updating the comic.
     * @param comicData - The comic data received from the request.
     * @param existingComicId - Optional ID (UUID) if updating an existing comic.
     * @returns The saved/updated comic object (adjust return type as needed).
     */
    async saveComicWithPanels(
        internalUserId: string,
        comicData: ComicDataFromRequest,
        existingComicId?: string
    ): Promise<any> {

        const client: PoolClient = await pool.connect();
        console.log(`Starting saveComicWithPanels for user: ${internalUserId}, comicId: ${existingComicId || 'NEW'}`);

        try {
            await client.query('BEGIN');

            const userCheckResult = await client.query('SELECT user_id FROM users WHERE user_id = $1', [internalUserId]);
            if (userCheckResult.rows.length === 0) {
                console.error(`User not found for internal ID: ${internalUserId}`);
                throw new Error("User not found");
            }
            console.log(`User ${internalUserId} verified.`);

            let comicId: string;

            if (existingComicId) {
                comicId = existingComicId;
                console.log(`Updating existing comic: ${comicId}`);

                const comicCheckResult = await client.query(
                    'SELECT comic_id FROM comics WHERE comic_id = $1 AND user_id = $2 FOR UPDATE',
                    [comicId, internalUserId]
                );
                if (comicCheckResult.rows.length === 0) {
                    throw new Error("Comic not found or user mismatch");
                }

                await client.query(
                    'UPDATE comics SET title = $1, description = $2, characters = $3, setting = $4, updated_at = NOW() WHERE comic_id = $5',
                    [
                        comicData.title,
                        comicData.description,
                        JSON.stringify(comicData.characters ?? null),
                        JSON.stringify(comicData.setting ?? null),
                        comicId
                    ]
                );
                console.log(`Comic ${comicId} metadata updated.`);

                console.log(`Clearing old pages/panels for comic ${comicId}`);
                await client.query('DELETE FROM panels WHERE page_id IN (SELECT page_id FROM pages WHERE comic_id = $1)', [comicId]);
                await client.query('DELETE FROM pages WHERE comic_id = $1', [comicId]);
                console.log(`Old pages/panels cleared for comic ${comicId}.`);

            } else {
                console.log(`Creating new comic for user: ${internalUserId}`);
                comicId = crypto.randomUUID();
                await client.query(
                    'INSERT INTO comics (comic_id, user_id, title, description, characters, setting) VALUES ($1, $2, $3, $4, $5, $6)',
                    [
                        comicId,
                        internalUserId,
                        comicData.title,
                        comicData.description,
                        JSON.stringify(comicData.characters ?? null),
                        JSON.stringify(comicData.setting ?? null)
                    ]
                );
                console.log(`New comic created with ID: ${comicId}.`);
            }

            // --- Process Pages and Panels ---
            // Iterate through pages provided in the request data
            for (const pageData of comicData.pages) {
                const pageId = crypto.randomUUID();
                await client.query(
                    'INSERT INTO pages (page_id, comic_id, page_number) VALUES ($1, $2, $3)',
                    [pageId, comicId, pageData.pageNumber]
                );
                console.log(`Created page number: ${pageData.pageNumber}, DB ID: ${pageId}`);

                // Iterate through panels within the current page
                for (const panelData of pageData.panels) {
                    const panelId = crypto.randomUUID();
                    await client.query(
                        'INSERT INTO panels (panel_id, page_id, panel_number, prompt, dialogue, layout_position) VALUES ($1, $2, $3, $4, $5, $6)',
                        [
                            panelId,
                            pageId,
                            panelData.panelNumber,
                            panelData.prompt,
                            panelData.dialogue,
                            JSON.stringify(panelData.layoutPosition ?? null)
                        ]
                    );
                    console.log(`Created panel number: ${panelData.panelNumber}, DB ID: ${panelId}`);

                    console.log(`Uploading image for panel ${panelId} from temp URL: ${panelData.generatedImageUrl}`);
                    const s3ImageUrl = await this.uploadImageToS3(
                        panelData.generatedImageUrl,
                        internalUserId,
                        comicId,
                        panelId
                    );

                    await client.query(
                        'UPDATE panels SET image_url = $1, updated_at = NOW() WHERE panel_id = $2',
                        [s3ImageUrl, panelId]
                    );
                    console.log(`Updated panel ${panelId} with S3 URL: ${s3ImageUrl}`);

                }
            }

            await client.query('COMMIT');
            console.log(`Successfully saved comic ${comicId}. Transaction committed.`);

            return { id: comicId, message: "Comic saved successfully" };

        } catch (error: any) {
            await client.query('ROLLBACK');
            console.error(`Error during saveComicWithPanels for comic ${existingComicId || 'NEW'}. Rolling back transaction.`, error);
            throw new Error(`Failed to save comic: ${error.message}`);
        } finally {
            client.release();
            console.log(`Finished saveComicWithPanels attempt for comic ${existingComicId || 'NEW'}. Client released.`);
        }
    }


    // --- Helper: Script Parsing ---
    private parseComicScript(script: string): ScriptPanel[] {
        console.log("Parsing script...");
        const panelRegex = /Panel\s*(\d+):\s*([\s\S]*?)(?=Panel\s*\d+:|$)/gi;
        const dialogueRegex = /([A-Z\s0-9]+):\s*"([^"]+)"/g;
        const panels: ScriptPanel[] = [];
        let match;
        while ((match = panelRegex.exec(script)) !== null) {
            const panelNumber = match[1].trim();
            const panelContent = match[2].trim();
            const dialogue: Dialogue[] = [];
            let dialogueMatch;
            let remainingContent = panelContent;
            dialogueRegex.lastIndex = 0;
            while ((dialogueMatch = dialogueRegex.exec(panelContent)) !== null) {
                const character = dialogueMatch[1].trim();
                const text = dialogueMatch[2].trim();
                dialogue.push({ character, text });
                remainingContent = remainingContent.replace(dialogueMatch[0], '');
            }
            const description = remainingContent
                .replace(/Description:\s*/i, '')
                .replace(/^[A-Z\s0-9]+:\s*".*"$/gm, '')
                .replace(/\n+/g, ' ')
                .trim();
            panels.push({ panelNumber, description, dialogue });
        }
        if (panels.length === 0 && script.trim().length > 0) {
            console.warn("Script parsing did not find 'Panel X:'. Attempting direct parse.");
            const dialogue: Dialogue[] = [];
            let dialogueMatch;
            let remainingContent = script;
            dialogueRegex.lastIndex = 0;
            while ((dialogueMatch = dialogueRegex.exec(script)) !== null) {
                const character = dialogueMatch[1].trim();
                const text = dialogueMatch[2].trim();
                dialogue.push({ character, text });
                remainingContent = remainingContent.replace(dialogueMatch[0], '');
            }
            const description = remainingContent.replace(/Description:\s*/i, '').replace(/^[A-Z\s0-9]+:\s*".*"$/gm, '').trim();
            panels.push({ panelNumber: '1', description, dialogue });
        }
        return panels;
    }

    // --- Add other methods as needed ---
    // async getComicById(comicId: string): Promise<any> { /* ... DB logic using pool.query ... */ }
    // async listComicsByUser(userId: string): Promise<any[]> { /* ... DB logic using pool.query ... */ }
    // async deleteComic(comicId: string, userId: string): Promise<void> { /* ... DB logic + S3 cleanup ... */ }

}
