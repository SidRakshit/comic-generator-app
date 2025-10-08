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
import { stripeService } from "./stripe.service";
import { CreateComicRequest, ComicPageRequest, ComicPanelRequest, ComicResponse, ComicPageResponse, EXTERNAL_APIS, AI_CONFIG, FILE_FORMATS, CONTENT_TYPES, S3_CONFIG } from "@repo/common-types";

// Use shared types from @repo/common-types
// Map the shared API types to our internal naming for easier migration:
type PanelDataFromRequest = {
	panelNumber: ComicPanelRequest['panel_number'];
	prompt: NonNullable<ComicPanelRequest['prompt']>;
	dialogue?: ComicPanelRequest['dialogue'];
	layoutPosition: ComicPanelRequest['layout_position'];
	imageBase64: NonNullable<ComicPanelRequest['image_base64']>;
};

type PageDataFromRequest = {
	pageNumber: ComicPageRequest['page_number'];
	panels: PanelDataFromRequest[];
};

type ComicDataFromRequest = Omit<CreateComicRequest, 'pages'> & {
	pages: PageDataFromRequest[];
};

// Use shared ComicResponse type - this ensures SSoT compliance
// Make pages required for internal operations
type FullComicData = ComicResponse & {
	pages: NonNullable<ComicResponse['pages']>;
};

// Use the shared types from common-types for consistency

type FullPageData = ComicPageResponse;

// Helper function to convert from shared API types to internal format
function convertApiRequestToInternal(apiRequest: CreateComicRequest): ComicDataFromRequest {
	return {
		title: apiRequest.title,
		description: apiRequest.description,
		characters: apiRequest.characters,
		setting: apiRequest.setting,
		template: apiRequest.template,
		pages: apiRequest.pages.map(page => ({
			pageNumber: page.page_number,
			panels: page.panels.map(panel => ({
				panelNumber: panel.panel_number,
				prompt: panel.prompt || "",
				dialogue: panel.dialogue,
				layoutPosition: panel.layout_position || {},
				imageBase64: panel.image_base64 || "",
			}))
		}))
	};
}

// Local types for database operations (for other methods)
interface Comic {
	comic_id: string;
	user_id: string;
	title: string;
	description?: string;
	created_at: string;
	updated_at: string;
	panel_count: number;
	published: boolean;
	cover_image_url?: string;
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
	 * Generates an image for a comic panel using OpenAI DALL-E API.
	 * RESTORED: Original working version that returns base64 data, no S3 upload
	 * @param panelDescription - Description of the panel to generate image for.
	 * @param characterContext - Character information for visual consistency
	 * @param dialogue - Dialogue text to include in the panel
	 * @returns Object containing base64 image data and prompt used.
	 */
	async generatePanelImage(userId: string, panelDescription: string, characterContext?: string, dialogue?: string): Promise<GeneratedImageData> {
		if (!OPENAI_API_KEY) {
			throw new Error("OpenAI API key is not configured.");
		}
		
		if (!panelDescription || panelDescription.trim() === "") {
			throw new Error("Panel description cannot be empty.");
		}

		console.log(`🎨 Generating image for description: "${panelDescription}"`);

		// Build enhanced prompt with character context for visual consistency
		let fullPrompt = `Comic book panel illustration: ${panelDescription}`;
		
		if (characterContext) {
			fullPrompt += `\n\nCharacter consistency requirements:\n${characterContext}\n\nMaintain consistent character appearance, clothing, and visual style across all panels.`;
		}
		
		if (dialogue) {
			fullPrompt += `\n\nDialogue: "${dialogue}"\n\nInclude this dialogue as speech bubbles or text in the comic panel. Make sure the dialogue is clearly visible and readable.`;
		}
		
		fullPrompt += `\n\n${AI_CONFIG.OPENAI.PROMPTS.IMAGE_STYLE_SUFFIX}`;

		try {
			// Generate image using DALL-E
			const response = await axios.post(
				EXTERNAL_APIS.OPENAI.IMAGE_GENERATIONS,
				{
					model: OPENAI_IMAGE_MODEL,
					prompt: fullPrompt,
					n: AI_CONFIG.OPENAI.IMAGE.N,
					size: AI_CONFIG.OPENAI.IMAGE.SIZE,
					quality: AI_CONFIG.OPENAI.IMAGE.QUALITY,
					response_format: AI_CONFIG.OPENAI.IMAGE.RESPONSE_FORMAT,
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

			await stripeService.decrementPanelBalance(userId);

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
			const contentType = CONTENT_TYPES.PNG;
			const fileExtension = FILE_FORMATS.PNG.substring(1); // Remove the dot

			// RESTORED: Original working S3 key format
			const s3Key = `users/${userId}/comics/${comicId}/panels/${panelId}.${fileExtension}`;
			console.log(`🔧 Uploading image to S3 bucket: ${S3_BUCKET_NAME}, Key: ${s3Key}`);

			// RESTORED: Original working PutObjectCommand format with proper ACL type
			const putObjectParams = {
				Bucket: S3_BUCKET_NAME,
				Key: s3Key,
				Body: imageData,
				ContentType: contentType,
				ACL: S3_CONFIG.ACL.PUBLIC_READ as ObjectCannedACL,
			};
			const command = new PutObjectCommand(putObjectParams);
			await s3Client.send(command);

			// Use centralized S3 URL template
			const s3Url = EXTERNAL_APIS.AWS.S3_URL_TEMPLATE(S3_BUCKET_NAME, AWS_REGION, s3Key);
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
	 * Save or update a comic from API request (uses shared types)
	 */
	async saveComicWithPanelsFromApi(
		internalUserId: string,
		apiRequest: CreateComicRequest,
		existingComicId?: string
	): Promise<FullComicData | null> {
		// Convert API request to internal format
		const comicData = convertApiRequestToInternal(apiRequest);
		// Use existing internal method
		return this.saveComicWithPanels(internalUserId, comicData, existingComicId);
	}

	/**
	 * RESTORED: Original working saveComicWithPanels function
	 * Saves or updates a comic, handling panel image uploads (from base64) to S3 and DB operations.
	 * @param internalUserId - The ID (UUID) of the user creating/updating the comic.
	 * @param comicData - The comic data received from the request (expects imageBase64 per panel).
	 * @param existingComicId - Optional ID (UUID) if updating an existing comic.
	 * @returns The saved/updated comic object.
	 */
	async saveComicWithPanels(
		internalUserId: string,
		comicData: ComicDataFromRequest,
		existingComicId?: string
	): Promise<FullComicData | null> {
		const client: PoolClient = await pool.connect();
		console.log(
			`Starting saveComicWithPanels for user: ${internalUserId}, comicId: ${
				existingComicId || "NEW"
			}`
		);

		try {
			await client.query("BEGIN");

			// Verify user exists
			const userCheckResult = await client.query(
				"SELECT user_id FROM users WHERE user_id = $1",
				[internalUserId]
			);
			if (userCheckResult.rows.length === 0) {
				console.error(`User not found for internal ID: ${internalUserId}`);
				throw new Error("User not found");
			}
			console.log(`User ${internalUserId} verified.`);

			let comicId: string;

			if (existingComicId) {
				// Update existing comic
				comicId = existingComicId;
				console.log(`Updating existing comic: ${comicId}`);
				
				const comicCheckResult = await client.query(
					"SELECT comic_id FROM comics WHERE comic_id = $1 AND user_id = $2 FOR UPDATE",
					[comicId, internalUserId]
				);
				if (comicCheckResult.rows.length === 0) {
					throw new Error("Comic not found or user mismatch");
				}
				
			await client.query(
				"UPDATE comics SET title = $1, description = $2, genre = $3, characters = $4, setting = $5, template = $6, updated_at = NOW() WHERE comic_id = $7",
				[
					comicData.title,
					comicData.description,
					comicData.genre || null,
					JSON.stringify(comicData.characters ?? null),
					JSON.stringify(comicData.setting ?? null),
					comicData.template || null,
					comicId,
				]
			);
				console.log(`Comic ${comicId} metadata updated.`);
				
				// Clear old pages/panels
				console.log(`Clearing old pages/panels for comic ${comicId}`);
				await client.query(
					"DELETE FROM panels WHERE page_id IN (SELECT page_id FROM pages WHERE comic_id = $1)",
					[comicId]
				);
				await client.query("DELETE FROM pages WHERE comic_id = $1", [comicId]);
				console.log(`Old pages/panels cleared for comic ${comicId}.`);
			} else {
				// Create new comic
				console.log(`Creating new comic for user: ${internalUserId}`);
				comicId = crypto.randomUUID();
				
			await client.query(
				"INSERT INTO comics (comic_id, user_id, title, description, genre, characters, setting, template, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())",
				[
					comicId,
					internalUserId,
					comicData.title,
					comicData.description,
					comicData.genre || null,
					JSON.stringify(comicData.characters ?? null),
					JSON.stringify(comicData.setting ?? null),
					comicData.template || null,
				]
			);
				console.log(`Created new comic with ID: ${comicId}`);
			}

			// Insert pages and panels
			for (const pageData of comicData.pages) {
				const pageId = crypto.randomUUID();
				await client.query(
					"INSERT INTO pages (page_id, comic_id, page_number) VALUES ($1, $2, $3)",
					[pageId, comicId, pageData.pageNumber]
				);
				console.log(
					`Created page number: ${pageData.pageNumber}, DB ID: ${pageId}`
				);

				for (const panelData of pageData.panels) {
					const panelId = crypto.randomUUID();
					await client.query(
						"INSERT INTO panels (panel_id, page_id, panel_number, prompt, dialogue, layout_position) VALUES ($1, $2, $3, $4, $5, $6)",
						[
							panelId,
							pageId,
							panelData.panelNumber,
							panelData.prompt,
							panelData.dialogue,
							JSON.stringify(panelData.layoutPosition ?? null),
						]
					);
					console.log(
						`Created panel number: ${panelData.panelNumber}, DB ID: ${panelId}`
					);

					// Upload image to S3 if base64 data is provided
					console.log(
						`Uploading image for panel ${panelId} using provided base64 data.`
					);
					if (!panelData.imageBase64) {
						console.warn(
							`Panel ${panelId} is missing image data. Skipping upload.`
						);
						await client.query(
							"UPDATE panels SET image_url = NULL, updated_at = NOW() WHERE panel_id = $1",
							[panelId]
						);
						continue;
					}

				const s3ImageUrl = await this.uploadImageToS3(
					panelData.imageBase64,
					internalUserId,
					comicId,
					panelId
				);

				await client.query(
					"UPDATE panels SET image_url = $1, updated_at = NOW() WHERE panel_id = $2",
					[s3ImageUrl, panelId]
				);
				console.log(`Updated panel ${panelId} with S3 URL: ${s3ImageUrl}`);

				await this.consumePanelCredits(client, internalUserId, 1);
				await this.recordPanelUsage(client, internalUserId, comicId, panelId, 1);
				}
			}

			await client.query("COMMIT");
			console.log(`Successfully saved comic ${comicId}. Transaction committed.`);
			return this.getComicById(comicId, internalUserId);
		} catch (error: any) {
			await client.query("ROLLBACK");
			console.error(
				`Error during saveComicWithPanels for comic ${
					existingComicId || "NEW"
				}. Rolling back transaction.`,
				error
			);
			if (error instanceof Error) {
				throw error;
			} else {
				throw new Error(`Failed to save comic: ${error.message || error}`);
			}
		} finally {
			client.release();
			console.log(
				`Finished saveComicWithPanels attempt for comic ${
					existingComicId || "NEW"
				}. Client released.`
			);
		}
	}

	/**
	 * RESTORED: Original working getComicById function
	 */
	async getComicById(
		comicId: string,
		internalUserId: string
	): Promise<FullComicData | null> {
		console.log(
			`Fetching comic details for comic: ${comicId}, user: ${internalUserId}`
		);
		const query = `
            SELECT
                c.comic_id, c.title, c.description, c.genre, c.characters, c.setting, c.template, c.created_at, c.updated_at,
                p.page_id, p.page_number,
                pn.panel_id, pn.panel_number, pn.prompt, pn.dialogue, pn.layout_position, pn.image_url
            FROM comics c
            LEFT JOIN pages p ON c.comic_id = p.comic_id
            LEFT JOIN panels pn ON p.page_id = pn.page_id
            WHERE c.comic_id = $1 AND c.user_id = $2
            ORDER BY p.page_number ASC, pn.panel_number ASC;
        `;

		try {
			const result = await pool.query(query, [comicId, internalUserId]);

			if (result.rows.length === 0) {
				console.log(
					`Comic ${comicId} not found or user ${internalUserId} not authorized.`
				);
				return null;
			}

			const comic: FullComicData = {
				comic_id: result.rows[0].comic_id,
				title: result.rows[0].title,
				description: result.rows[0].description || undefined,
				genre: result.rows[0].genre || undefined,
				characters: result.rows[0].characters || undefined,
				setting: result.rows[0].setting || undefined,
				template: result.rows[0].template || undefined,
				created_at: result.rows[0].created_at,
				updated_at: result.rows[0].updated_at,
				pages: [],
			};

			const pagesMap = new Map<string, FullPageData>();

			for (const row of result.rows) {
				if (!row.page_id) continue;

				let page = pagesMap.get(row.page_id);
				if (!page) {
				page = {
					page_id: row.page_id,
					page_number: row.page_number,
					panels: [],
				};
					pagesMap.set(row.page_id, page);
					comic.pages.push(page);
				}

				if (row.panel_id) {
				page.panels.push({
					panel_id: row.panel_id,
					panel_number: row.panel_number,
					prompt: row.prompt,
					dialogue: row.dialogue || undefined,
					layout_position: row.layout_position || {},
					image_url: row.image_url,
				});
				}
			}

			// Sort pages and panels after processing all rows
			comic.pages.sort((a, b) => a.page_number - b.page_number);
			comic.pages.forEach((page) => {
				page.panels.sort((a, b) => a.panel_number - b.panel_number);
			});

			console.log(`Successfully fetched comic details for ${comicId}`);
			return comic;
		} catch (error: any) {
			console.error(`Error fetching comic ${comicId} details:`, error);
			throw new Error("Failed to retrieve comic details.");
		}
	}

	/**
	 * Retrieves all comics for a specific user.
	 */
	async listComicsByUser(internalUserId: string): Promise<Comic[]> {
		try {
			console.log(`Service: Listing comics for user ${internalUserId}`);

			const result = await pool.query(
				`SELECT
					c.comic_id,
					c.title,
					c.description,
					c.created_at,
					c.updated_at,
					COUNT(pn.panel_id) as panel_count,
					false as published,
					-- Get the first panel's image as cover image
					COALESCE((
						SELECT pn2.image_url
						FROM pages p2
						JOIN panels pn2 ON p2.page_id = pn2.page_id
						WHERE p2.comic_id = c.comic_id
						AND pn2.image_url IS NOT NULL
						ORDER BY p2.page_number ASC, pn2.panel_number ASC
						LIMIT 1
					), NULL) as cover_image_url
				FROM comics c
				LEFT JOIN pages p ON c.comic_id = p.comic_id
				LEFT JOIN panels pn ON p.page_id = pn.page_id
				WHERE c.user_id = $1
				GROUP BY c.comic_id, c.title, c.description, c.created_at, c.updated_at
				ORDER BY c.updated_at DESC`,
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
	 * Deletes a comic and all its associated data (pages, panels, images) for the authenticated user.
	 * @param comicId - The ID of the comic to delete
	 * @param internalUserId - The ID of the user requesting the deletion
	 * @returns Promise<boolean> - True if the comic was deleted successfully, false if not found
	 */
	async deleteComic(comicId: string, internalUserId: string): Promise<boolean> {
		const client = await pool.connect();
		
		try {
			await client.query('BEGIN');

			// First, verify the comic exists and belongs to the user
			const comicCheck = await client.query(
				'SELECT comic_id FROM comics WHERE comic_id = $1 AND user_id = $2',
				[comicId, internalUserId]
			);

			if (comicCheck.rows.length === 0) {
				await client.query('ROLLBACK');
				return false; // Comic not found or doesn't belong to user
			}

			// Delete panels first (due to foreign key constraints)
			await client.query(
				"DELETE FROM panels WHERE page_id IN (SELECT page_id FROM pages WHERE comic_id = $1)",
				[comicId]
			);

			// Delete pages
			await client.query("DELETE FROM pages WHERE comic_id = $1", [comicId]);

			// Delete the comic itself
			await client.query("DELETE FROM comics WHERE comic_id = $1 AND user_id = $2", [comicId, internalUserId]);

			await client.query('COMMIT');
			
			console.log(`Service: Successfully deleted comic ${comicId} for user ${internalUserId}`);
			return true;
		} catch (error: any) {
			await client.query('ROLLBACK');
			console.error("Error in deleteComic:", error.message);
			throw error;
		} finally {
			client.release();
		}
	}

	private async recordPanelUsage(
		client: PoolClient,
		userId: string,
		comicId: string,
		panelId: string,
		creditsConsumed: number
	): Promise<void> {
		try {
			await client.query(
				`INSERT INTO panel_usage_log (user_id, comic_id, panel_id, credits_consumed)
				 VALUES ($1, $2, $3, $4)` ,
				[userId, comicId, panelId, creditsConsumed]
			);
		} catch (error) {
			console.warn("Failed to record panel usage log entry", error);
		}
	}

	private async consumePanelCredits(
		client: PoolClient,
		userId: string,
		amount: number
	): Promise<void> {
		const result = await client.query(
			`UPDATE user_credits
			 SET panel_balance = panel_balance - $1,
			     updated_at = NOW()
			 WHERE user_id = $2 AND panel_balance >= $1` ,
			[amount, userId]
		);

		if (result.rowCount === 0) {
			throw new Error("Insufficient panel balance during save operation");
		}
	}
}
