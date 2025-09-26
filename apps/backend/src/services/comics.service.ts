// src/services/comics.service.ts

// --- Core Dependencies ---
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import * as crypto from "crypto";
import { PoolClient } from "pg";
import {
	s3Client,
	S3_BUCKET_NAME,
	OPENAI_API_KEY,
	OPENAI_CHAT_MODEL,
	OPENAI_IMAGE_MODEL,
} from "../config";
import pool from "../database";
import { Panel } from "@repo/common-types";

// Local types for database operations
interface Comic {
	comic_id: string;
	user_id: string;
	title: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

interface ComicPage {
	page_id: string;
	comic_id: string;
	page_number: number;
	created_at: string;
	panels: Panel[];
}

interface ComicWithPanels extends Comic {
	pages: ComicPage[];
}

// Panel type for script generation (simpler than the full Panel interface)
interface ScriptPanel {
	panelNumber: number;
	dialogueText: string;
	panelDescription: string;
}

export class ComicService {
	constructor() {}

	/**
	 * Generates a single comic panel script using OpenAI Chat API.
	 * @param prompt - User input prompt for the comic panel.
	 * @returns Generated panel script object or null if parsing fails.
	 */
	async generateSinglePanelScript(prompt: string): Promise<ScriptPanel | null> {
		if (!OPENAI_API_KEY) {
			throw new Error("OpenAI API key is not configured.");
		}

		const systemMessage = `
You are a creative comic book writer. Generate a single comic panel based on the user's prompt.

Return ONLY a valid JSON object with this exact structure:
{
  "panelNumber": 1,
  "dialogueText": "Character dialogue here",
  "panelDescription": "Detailed visual description of the scene, characters, and setting for the artist"
}

Guidelines:
- Keep dialogue concise and impactful (max 2-3 sentences)
- Make panel descriptions vivid and specific for visual artists
- Ensure the content is appropriate for all audiences
- Focus on visual storytelling elements
`;

		try {
			const response = await axios.post(
				"https://api.openai.com/v1/chat/completions",
				{
					model: OPENAI_CHAT_MODEL,
					messages: [
						{ role: "system", content: systemMessage },
						{ role: "user", content: prompt },
					],
					max_tokens: 300,
					temperature: 0.8,
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const content = response.data.choices[0]?.message?.content?.trim();
			if (!content) {
				throw new Error("Empty response from OpenAI API.");
			}

			// Parse the JSON response
			try {
				const panelScript = JSON.parse(content);
				return panelScript as ScriptPanel;
			} catch (parseError) {
				console.error("Failed to parse OpenAI response as JSON:", content);
				return null;
			}
		} catch (error: any) {
			console.error("Error generating comic panel script:", error.message);
			throw error;
		}
	}

	/**
	 * Generates an image for a comic panel using OpenAI DALL-E API.
	 * @param panelDescription - Description of the panel to generate image for.
	 * @returns Object containing the image URL and metadata.
	 */
	async generatePanelImage(panelDescription: string): Promise<{
		imageUrl: string;
		s3Key: string;
		s3Url: string;
	}> {
		if (!OPENAI_API_KEY) {
			throw new Error("OpenAI API key is not configured.");
		}

		const imagePrompt = `
Create a comic book panel illustration with the following description: ${panelDescription}

Style: Clean comic book art style, vibrant colors, clear line work, professional comic illustration quality. Avoid any text or speech bubbles in the image.
`;

		try {
			// Generate image using DALL-E
			const response = await axios.post(
				"https://api.openai.com/v1/images/generations",
				{
					model: OPENAI_IMAGE_MODEL,
					prompt: imagePrompt,
					n: 1,
					size: "1024x1024",
					quality: "standard",
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const imageUrl = response.data.data[0]?.url;
			if (!imageUrl) {
				throw new Error("No image URL returned from OpenAI API.");
			}

			// Download and upload to S3
			const s3Data = await this.uploadImageToS3(imageUrl);

			return {
				imageUrl,
				s3Key: s3Data.s3Key,
				s3Url: s3Data.s3Url,
			};
		} catch (error: any) {
			console.error("Error generating panel image:", error.message);
			throw error;
		}
	}

	/**
	 * Downloads an image from a URL and uploads it to S3.
	 * @param imageUrl - URL of the image to download and upload.
	 * @returns Object containing S3 key and URL.
	 */
	private async uploadImageToS3(imageUrl: string): Promise<{
		s3Key: string;
		s3Url: string;
	}> {
		if (!S3_BUCKET_NAME) {
			throw new Error("S3 bucket name is not configured.");
		}

		if (!s3Client) {
			throw new Error("S3 client is not initialized.");
		}

		try {
			// Download the image
			const imageResponse = await axios.get(imageUrl, {
				responseType: "arraybuffer",
			});
			const imageBuffer = Buffer.from(imageResponse.data);

			// Generate a unique key for the image
			const timestamp = Date.now();
			const randomString = crypto.randomBytes(8).toString("hex");
			const s3Key = `comic-panels/${timestamp}-${randomString}.png`;

			// Upload to S3 - removed ACL to avoid permission issues
			const uploadCommand = new PutObjectCommand({
				Bucket: S3_BUCKET_NAME,
				Key: s3Key,
				Body: imageBuffer,
				ContentType: "image/png",
			});

			await s3Client.send(uploadCommand);

			const s3Url = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

			return { s3Key, s3Url };
		} catch (error: any) {
			console.error("Error uploading image to S3:", error.message);
			throw error;
		}
	}

	/**
	 * Saves a comic with its pages and panels to the database.
	 * Handles both creating new comics and updating existing ones.
	 */
	async saveComicWithPanels(
		internalUserId: string,
		comicData: ComicWithPanels,
		comicId?: string
	): Promise<ComicWithPanels> {
		const client: PoolClient = await pool.connect();

		try {
			await client.query("BEGIN");

			let savedComic: Comic;

			if (comicId) {
				// Update existing comic
				console.log(
					`Service: Updating existing comic ${comicId} for user ${internalUserId}`
				);

				// Verify the comic belongs to the user
				const existingComicResult = await client.query(
					"SELECT * FROM comics WHERE comic_id = $1 AND user_id = $2",
					[comicId, internalUserId]
				);

				if (existingComicResult.rows.length === 0) {
					throw new Error("Comic not found or user mismatch");
				}

				// Update the comic
				const updateComicResult = await client.query(
					`UPDATE comics 
           SET title = $1, description = $2, updated_at = NOW()
           WHERE comic_id = $3 AND user_id = $4
           RETURNING *`,
					[comicData.title, comicData.description, comicId, internalUserId]
				);

				savedComic = updateComicResult.rows[0];

				// Delete existing pages and panels for this comic
				await client.query("DELETE FROM panels WHERE comic_id = $1", [comicId]);
				await client.query("DELETE FROM pages WHERE comic_id = $1", [comicId]);
			} else {
				// Create new comic
				console.log(
					`Service: Creating new comic for user ${internalUserId}: ${comicData.title}`
				);

				const insertComicResult = await client.query(
					`INSERT INTO comics (user_id, title, description, created_at, updated_at) 
           VALUES ($1, $2, $3, NOW(), NOW()) 
           RETURNING *`,
					[internalUserId, comicData.title, comicData.description]
				);

				savedComic = insertComicResult.rows[0];
			}

			// Save pages and panels
			const savedPages: ComicPage[] = [];

			for (const page of comicData.pages) {
				console.log(
					`Service: Saving page ${page.page_number} for comic ${savedComic.comic_id}`
				);

				// Insert the page
				const insertPageResult = await client.query(
					`INSERT INTO pages (comic_id, page_number, created_at) 
           VALUES ($1, $2, NOW()) 
           RETURNING *`,
					[savedComic.comic_id, page.page_number]
				);

				const savedPage = insertPageResult.rows[0];

				// Save panels for this page
				const savedPanels: Panel[] = [];

				for (const panel of page.panels) {
					console.log(
						`Service: Saving panel ${panel.panelNumber || 'unknown'} for page ${savedPage.page_id}`
					);

					const insertPanelResult = await client.query(
						`INSERT INTO panels (comic_id, page_id, panel_number, dialogue_text, panel_description, image_url, s3_key, s3_url, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
             RETURNING *`,
						[
							savedComic.comic_id,
							savedPage.page_id,
							panel.panelNumber || 1,
							panel.prompt || '',
							panel.prompt || '',
							panel.imageUrl || null,
							null, // s3_key
							panel.imageUrl || null,
						]
					);

					savedPanels.push(insertPanelResult.rows[0]);
				}

				savedPages.push({
					...savedPage,
					panels: savedPanels,
				});
			}

			await client.query("COMMIT");

			console.log(
				`Service: Successfully saved comic ${savedComic.comic_id} with ${savedPages.length} pages`
			);

			return {
				...savedComic,
				pages: savedPages,
			};
		} catch (error: any) {
			await client.query("ROLLBACK");
			console.error("Error in saveComicWithPanels:", error.message);
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * Retrieves all comics for a specific user.
	 */
	async listComicsByUser(internalUserId: string): Promise<Comic[]> {
		try {
			console.log(`Service: Listing comics for user ${internalUserId}`);

			const result = await pool.query(
				`SELECT comic_id, title, description, created_at, updated_at 
         FROM comics 
         WHERE user_id = $1 
         ORDER BY updated_at DESC`,
				[internalUserId]
			);

			console.log(`Service: Found ${result.rows.length} comics for user`);
			return result.rows;
		} catch (error: any) {
			console.error("Error in listComicsByUser:", error.message);
			throw error;
		}
	}

	/**
	 * Retrieves a specific comic with all its pages and panels.
	 */
	async getComicById(
		comicId: string,
		internalUserId: string
	): Promise<ComicWithPanels | null> {
		try {
			console.log(
				`Service: Fetching comic ${comicId} for user ${internalUserId}`
			);

			// Get the comic
			const comicResult = await pool.query(
				`SELECT * FROM comics 
         WHERE comic_id = $1 AND user_id = $2`,
				[comicId, internalUserId]
			);

			if (comicResult.rows.length === 0) {
				console.log(`Service: Comic ${comicId} not found for user`);
				return null;
			}

			const comic = comicResult.rows[0];

			// Get pages with panels
			const pagesResult = await pool.query(
				`SELECT p.*, 
            json_agg(
              json_build_object(
                'panel_id', pan.panel_id,
                'panelNumber', pan.panel_number,
                'dialogueText', pan.dialogue_text,
                'panelDescription', pan.panel_description,
                'imageUrl', pan.image_url,
                's3Key', pan.s3_key,
                's3Url', pan.s3_url,
                'createdAt', pan.created_at
              ) ORDER BY pan.panel_number
            ) as panels
         FROM pages p
         LEFT JOIN panels pan ON p.page_id = pan.page_id
         WHERE p.comic_id = $1
         GROUP BY p.page_id, p.comic_id, p.page_number, p.created_at
         ORDER BY p.page_number`,
				[comicId]
			);

			const pages = pagesResult.rows.map((page) => ({
				...page,
				panels: page.panels.filter((panel: any) => panel.panel_id !== null),
			}));

			console.log(
				`Service: Found comic with ${pages.length} pages and ${pages.reduce(
					(total: number, page: any) => total + page.panels.length,
					0
				)} panels`
			);

			return {
				...comic,
				pages,
			};
		} catch (error: any) {
			console.error("Error in getComicById:", error.message);
			throw error;
		}
	}
}