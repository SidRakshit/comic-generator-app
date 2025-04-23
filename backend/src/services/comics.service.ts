// src/services/comic.service.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// You'll need API keys in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface Panel {
    panelNumber: string;
    description: string;
    dialogue: { character: string; text: string }[];
    imageUrl?: string;
}

export interface Comic {
    prompt: string;
    script: string;
    panels: Panel[];
}

export class ComicService {
    async generateComic(prompt: string): Promise<Comic> {
        // 1. Generate story/text with LLM
        const storyResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a comic writer. Create a short comic script with dialogue and scene descriptions.'
                    },
                    {
                        role: 'user',
                        content: `Create a panel about: ${prompt}`
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

        const comicScript = storyResponse.data.choices[0].message.content;

        // 2. Parse script into panels
        const panels = this.parseComicScript(comicScript);

        // 3. Generate an image for each panel
        const comicPanels = await Promise.all(
            panels.map(async (panel) => {
                const imageResponse = await axios.post(
                    'https://api.openai.com/v1/images/generations',
                    {
                        prompt: `Comic panel: ${panel.description}. Style: comic book illustration, detailed, vibrant.`,
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

                return {
                    ...panel,
                    imageUrl: imageResponse.data.data[0].url
                };
            })
        );

        // 4. Return the complete comic
        return {
            prompt,
            script: comicScript,
            panels: comicPanels
        };
    }

    // Helper function to parse comic script into panels
    private parseComicScript(script: string): Panel[] {
        // This is a simplified parser - you might need a more robust one
        const panelRegex = /Panel\s*(\d+):\s*([\s\S]*?)(?=Panel\s*\d+:|$)/gi;
        const dialogueRegex = /([A-Za-z\s]+):\s*"([^"]+)"/g;

        const panels: Panel[] = [];
        let match;

        while ((match = panelRegex.exec(script)) !== null) {
            const panelNumber = match[1];
            const panelContent = match[2].trim();

            // Extract dialogue
            const dialogue = [];
            let dialogueMatch;
            while ((dialogueMatch = dialogueRegex.exec(panelContent)) !== null) {
                dialogue.push({
                    character: dialogueMatch[1].trim(),
                    text: dialogueMatch[2]
                });
            }

            // The description is everything else
            let description = panelContent;
            for (const d of dialogue) {
                description = description.replace(`${d.character}: "${d.text}"`, '');
            }
            description = description.trim();

            panels.push({
                panelNumber,
                description,
                dialogue
            });
        }

        return panels;
    }
}