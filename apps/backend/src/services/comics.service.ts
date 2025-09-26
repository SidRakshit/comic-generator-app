// src/services/comics.service.ts

// --- Core Dependencies ---
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import axios from "axios";
import * as crypto from "crypto";
import { PoolClient } from "pg";
import {
	s3Client,
	S3_BUCKET_NAME,
	OPENAI_API_KEY,
	OPENAI_CHAT_MODEL,
	OPENAI_IMAGE_MODEL,
	AWS_REGION,
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

// Image generation result - matches original working format
interface GeneratedImageData {
	imageData: string; // Base64 encoded image data
	promptUsed: string;
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
	 * RESTORED: Original working version that returns base64 data, no S3 upload
	 * @param panelDescription - Description of the panel to generate image for.
	 * @returns Object containing base64 image data and prompt used.
	 */
	async generatePanelImage(panelDescription: string): Promise<GeneratedImageData> {
		if (!OPENAI_API_KEY) {
			throw new Error("OpenAI API key is not configured.");
		}
		
		if (!panelDescription || panelDescription.trim() === "") {
			throw new Error("Panel description cannot be empty.");
		}

		console.log(`🎨 Generating image for description: "${panelDescription}"`);

		const fullPrompt = `Comic book panel illustration: ${panelDescription}. Style: vibrant, detailed comic book art, clear line work, professional quality.`;

		try {
			// Generate image using DALL-E
			const response = await axios.post(
				"https://api.openai.com/v1/images/generations",
				{
					model: OPENAI_IMAGE_MODEL,
					prompt: fullPrompt,
					n: 1,
					size: "1024x1024",
					quality: "standard",
					response_format: "b64_json", // Request base64 format directly
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const responseData = response.data.data[0];
			let imageDataBase64: string | null = null;

			if (responseData?.b64_json) {
				console.log("✅ Received b64_json from OpenAI.");
				imageDataBase64 = responseData.b64_json;
			} else if (responseData?.url) {
				console.log("⚠️  Received URL from OpenAI, converting to base64...");
				// Download and convert to base64
				const imageResponse = await axios.get(responseData.url, {
					responseType: "arraybuffer",
				});
				const imageBuffer = Buffer.from(imageResponse.data);
				imageDataBase64 = imageBuffer.toString("base64");
			} else {
				throw new Error("No image data received from OpenAI API.");
			}

			if (!imageDataBase64) {
				throw new Error("Failed to get image data from OpenAI response.");
			}

			console.log(`✅ Image generated successfully (${imageDataBase64.length} chars base64)`);

			// Return base64 data - NO S3 UPLOAD HERE (matches original working version)
			return {
				imageData: imageDataBase64,
				promptUsed: fullPrompt,
			};

		} catch (error: any) {
			console.error("❌ Error generating panel image:", error.message);
			throw error;
		}
	}

	/**
	 * Uploads image data (from base64 string) to S3.
	 * RESTORED: Original working version with proper S3 key format
	 * @param imageBase64 The base64 encoded image data.
	 * @param userId The user's ID.
	 * @param comicId The comic's ID.
	 * @param panelId The panel's ID.
	 * @returns The final public URL of the uploaded image in S3.
	 */
	private async uploadImageToS3(
		imageBase64: string,
		userId: string,
		comicId: string,
		panelId: string
	): Promise<string> {
		if (!imageBase64) {
			throw new Error("Image data (base64) is missing, cannot upload.");
		}

		if (!s3Client) {
			throw new Error("S3 client is not configured. Please check AWS credentials.");
		}

		try {
			const imageData: Buffer = Buffer.from(imageBase64, "base64");
			const contentType = "image/png";
			const fileExtension = "png";

			// RESTORED: Original working S3 key format
			const s3Key = `users/${userId}/comics/${comicId}/panels/${panelId}.${fileExtension}`;
			console.log(`🔧 Uploading image to S3 bucket: ${S3_BUCKET_NAME}, Key: ${s3Key}`);

			// RESTORED: Original working PutObjectCommand format with proper ACL type
			const putObjectParams = {
				Bucket: S3_BUCKET_NAME,
				Key: s3Key,
				Body: imageData,
				ContentType: contentType,
				ACL: "public-read" as ObjectCannedACL,
			};
			const command = new PutObjectCommand(putObjectParams);
			await s3Client.send(command);

			// RESTORED: Original working S3 URL format
			const s3Url = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
			console.log(`✅ Successfully uploaded image to: ${s3Url}`);
			return s3Url;
		} catch (error: any) {
			console.error("❌ Error in uploadImageToS3:", error);
			if (error.message?.includes("base64")) {
				throw new Error(`Invalid Base64 data provided: ${error.message}`);
			} else if (
				error.name?.includes("Credentials") ||
				error.message?.includes("credentials")
			) {
				throw new Error(`AWS Credentials error: ${error.message}`);
			}
			throw new Error(`Failed to process image upload: ${error.message}`);
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