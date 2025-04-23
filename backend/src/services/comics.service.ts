// src/services/comics.service.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface Dialogue {
    character: string;
    text: string;
}

export interface ScriptPanel {
    panelNumber: string;
    description: string;
    dialogue: Dialogue[];
}

export interface PanelImage {
    imageUrl: string;
}

export class ComicService {

    /**
     * Generates the script (panel description and dialogue) for a SINGLE panel.
     * @param prompt The user's prompt describing the desired panel content.
     * @returns A promise that resolves to a ScriptPanel object or null.
     */
    async generateSinglePanelScript(prompt: string): Promise<ScriptPanel | null> { // Renamed for clarity
        if (!OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured.');
        }
        if (!prompt || prompt.trim() === '') {
            throw new Error('Prompt cannot be empty.');
        }

        console.log(`Generating script for single panel prompt: "${prompt}"`);

        try {
            const storyResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
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

            const panels = this.parseComicScript(`Panel 1: ${panelContent}`);
            console.log("Parsed single panel:", panels);

            return panels.length > 0 ? panels[0] : null;

        } catch (error: any) {
            console.error('Error calling OpenAI for single panel script generation:', error.response?.data || error.message);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('OpenAI API key is invalid or expired.');
            }
            throw new Error('Failed to generate panel script from OpenAI.');
        }
    }

    /**
     * Generates an image URL for a given panel description.
     * (This function remains the same)
     * @param panelDescription Text description of the panel scene.
     * @returns A promise that resolves to a PanelImage object containing the image URL.
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
            const imageResponse = await axios.post(
                'https://api.openai.com/v1/images/generations',
                {
                    prompt: `Comic book panel illustration: ${panelDescription}. Style: vibrant, detailed.`,
                    n: 1,
                    size: '512x512'
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
            return { imageUrl };
        } catch (error: any) {
            console.error('Error calling OpenAI for image generation:', error.response?.data || error.message);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('OpenAI API key is invalid or expired.');
            } else if (axios.isAxiosError(error) && error.response?.data?.error?.code === 'content_policy_violation') {
                throw new Error('Image generation failed due to content policy violation.');
            }
            throw new Error('Failed to generate panel image from OpenAI.');
        }
    }

    private parseComicScript(script: string): ScriptPanel[] {
        console.log("Parsing script...");
        const panelRegex = /Panel\s*(\d+):\s*([\s\S]*?)(?=Panel\s*\d+:|$)/gi;
        const dialogueRegex = /([A-Z\s]+):\s*"([^"]+)"/g;

        const panels: ScriptPanel[] = [];
        let match;

        while ((match = panelRegex.exec(script)) !== null) {
            const panelNumber = match[1].trim();
            const panelContent = match[2].trim();
            const dialogue: Dialogue[] = [];
            let dialogueMatch;
            let remainingContent = panelContent;
            while ((dialogueMatch = dialogueRegex.exec(panelContent)) !== null) {
                const character = dialogueMatch[1].trim();
                const text = dialogueMatch[2].trim();
                dialogue.push({ character, text });
                remainingContent = remainingContent.replace(dialogueMatch[0], '');
            }
            const description = remainingContent
                .replace(/^[A-Z\s]+:\s*".*"$/gm, '')
                .trim();
            panels.push({ panelNumber, description, dialogue });
        }
        if (panels.length === 0 && script.includes(':') && script.trim().length > 0) {
            console.warn("Script parsing did not find a 'Panel X:' structure. Attempting to parse directly.");
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
            const description = remainingContent
                .replace(/^[A-Z\s]+:\s*".*"$/gm, '')
                .trim();
            panels.push({ panelNumber: '1', description, dialogue });
        } else if (panels.length === 0 && script.trim().length > 0) {
            console.warn("Script parsing failed and direct parse fallback didn't apply. Using full input as description.");
            panels.push({ panelNumber: '1', description: script.trim(), dialogue: [] });
        }
        return panels;
    }
}