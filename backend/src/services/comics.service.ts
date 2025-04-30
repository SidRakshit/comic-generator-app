// backend/src/services/comics.service.ts

// --- Core Dependencies ---
import { PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import crypto from "crypto";
import { Pool, PoolClient } from "pg";

// --- Configuration Import ---
import { s3Client, S3_BUCKET, OPENAI_API_KEY } from "../config";

// --- Database Pool Import ---
import pool from "../database";

// --- Interfaces (Keep existing interfaces: Dialogue, ScriptPanel, PanelImage) ---
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
interface FullComicData extends ComicDataFromRequest {
	comic_id: string;
	created_at: Date;
	updated_at: Date;
	pages: FullPageData[];
}
interface FullPageData extends PageDataFromRequest {
	page_id: string;
	panels: FullPanelData[];
}
interface FullPanelData extends PanelDataFromRequest {
	panel_id: string;
	image_url: string;
}
interface ComicListItem {
	comic_id: string;
	title: string;
	created_at: Date;
	updated_at: Date;
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
			throw new Error("OpenAI API key is not configured.");
		}
		if (!prompt || prompt.trim() === "") {
			throw new Error("Prompt cannot be empty.");
		}
		console.log(`Generating script for single panel prompt: "${prompt}"`);
		try {
			// *** Restored OpenAI API call for script generation ***
			const storyResponse = await axios.post(
				"https://api.openai.com/v1/chat/completions",
				{
					model: "gpt-4", // Consider using a newer model if available/needed
					messages: [
						{
							role: "system",
							content: `You are a comic writer. Describe a single comic panel based on the user's prompt. Provide a scene description and any character dialogue. Format clearly. Example:\nDescription: [Scene description]\nCHARACTER: "Dialogue"\nCHARACTER 2: "Dialogue"`,
						},
						{
							role: "user",
							content: `Generate a single comic panel description and dialogue for: ${prompt}`,
						},
					],
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const panelContent = storyResponse.data.choices[0]?.message?.content;
			if (!panelContent) {
				throw new Error("Failed to get panel content from OpenAI response.");
			}
			console.log("Raw panel content received:", panelContent);
			const panels = this.parseComicScript(`Panel 1: ${panelContent}`); // Use internal parser
			console.log("Parsed single panel:", panels);
			return panels.length > 0 ? panels[0] : null;
		} catch (error: any) {
			// *** Restored Error Handling ***
			console.error(
				"Error calling OpenAI for single panel script generation:",
				error.response?.data || error.message
			);
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				throw new Error("OpenAI API key is invalid or expired.");
			}
			throw new Error("Failed to generate panel script from OpenAI.");
		}
	}

	/**
	 * Generates an image URL for a given panel description using OpenAI.
	 * @param panelDescription Text description of the panel scene.
	 * @returns A promise that resolves to a PanelImage object containing the temporary image URL.
	 */
	async generatePanelImage(panelDescription: string): Promise<PanelImage> {
		if (!OPENAI_API_KEY) {
			throw new Error("OpenAI API key is not configured.");
		}
		if (!panelDescription || panelDescription.trim() === "") {
			throw new Error("Panel description cannot be empty.");
		}
		console.log(`Generating image for description: "${panelDescription}"`);
		try {
			// *** Restored OpenAI API call for image generation ***
			const imageResponse = await axios.post(
				"https://api.openai.com/v1/images/generations",
				{
					// Consider using DALL-E 3 if available via API
					prompt: `Comic book panel illustration: ${panelDescription}. Style: vibrant, detailed.`,
					n: 1,
					size: "512x512", // Or '1024x1024' etc.
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
				}
			);

			const imageUrl = imageResponse.data.data[0]?.url;
			if (!imageUrl) {
				throw new Error("Failed to get image URL from OpenAI response.");
			}
			console.log("Image URL received:", imageUrl);
			return { imageUrl }; // Returns the temporary URL
		} catch (error: any) {
			// *** Restored Error Handling ***
			console.error(
				"Error calling OpenAI for image generation:",
				error.response?.data || error.message
			);
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				throw new Error("OpenAI API key is invalid or expired.");
			} else if (
				axios.isAxiosError(error) &&
				error.response?.data?.error?.code === "content_policy_violation"
			) {
				throw new Error(
					"Image generation failed due to content policy violation."
				);
			}
			throw new Error("Failed to generate panel image from OpenAI.");
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
			const response = await axios.get(tempImageUrl, {
				responseType: "arraybuffer",
			});
			if (response.status !== 200) {
				throw new Error(`Failed to download image. Status: ${response.status}`);
			}

			const imageData: Buffer = response.data;
			let contentType =
				response.headers["content-type"] || "application/octet-stream";
			let fileExtension = "bin";
			if (contentType.startsWith("image/")) {
				fileExtension = contentType.split("/")[1].split("+")[0];
			} else {
				console.warn(
					`Unexpected content type "${contentType}", using default extension.`
				);
				contentType = "application/octet-stream";
			}

			// const s3Key = `users/${userId}/comics/${comicId}/panels/${panelId}.${fileExtension}`;

			const s3Key = `users/<span class="math-inline">\{userId\}/comics/</span>{comicId}/panels/<span class="math-inline">\{panelId\}\.</span>{fileExtension}`; // NEW way - use detected extension
			const s3Url = `https://<span class="math-inline">\{S3\_BUCKET\}\.s3\.</span>{awsRegion}.amazonaws.com/${s3Key}`;
			console.log(`Constructed S3 Key: ${s3Key}`); // Log the key
			console.log(`Constructed S3 URL: ${s3Url}`); // Log the UR
			console.log(`Uploading image to S3 bucket: ${S3_BUCKET}, Key: ${s3Key}`);

			const putObjectParams = {
				Bucket: S3_BUCKET,
				Key: s3Key,
				Body: imageData,
				ContentType: contentType,
			};
			const command = new PutObjectCommand(putObjectParams);
			await s3Client.send(command);

			// const s3Url = `https://${S3_BUCKET}.s3.${awsRegion}.amazonaws.com/${s3Key}`;
			console.log(`Successfully uploaded image to: ${s3Url}`);
			return s3Url;
		} catch (error: any) {
			console.error("Error in uploadImageToS3:", error);
			if (axios.isAxiosError(error)) {
				throw new Error(
					`Failed to download image from temp URL: ${error.message}`
				);
			} else if (
				error.name?.includes("Credentials") ||
				error.message?.includes("credentials")
			) {
				throw new Error(`AWS Credentials error: ${error.message}`);
			}
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
		console.log(
			`Starting saveComicWithPanels for user: ${internalUserId}, comicId: ${
				existingComicId || "NEW"
			}`
		);

		try {
			await client.query("BEGIN");

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
					"UPDATE comics SET title = $1, description = $2, characters = $3, setting = $4, updated_at = NOW() WHERE comic_id = $5",
					[
						comicData.title,
						comicData.description,
						JSON.stringify(comicData.characters ?? null),
						JSON.stringify(comicData.setting ?? null),
						comicId,
					]
				);
				console.log(`Comic ${comicId} metadata updated.`);

				console.log(`Clearing old pages/panels for comic ${comicId}`);
				await client.query(
					"DELETE FROM panels WHERE page_id IN (SELECT page_id FROM pages WHERE comic_id = $1)",
					[comicId]
				);
				await client.query("DELETE FROM pages WHERE comic_id = $1", [comicId]);
				console.log(`Old pages/panels cleared for comic ${comicId}.`);
			} else {
				console.log(`Creating new comic for user: ${internalUserId}`);
				comicId = crypto.randomUUID();
				await client.query(
					"INSERT INTO comics (comic_id, user_id, title, description, characters, setting) VALUES ($1, $2, $3, $4, $5, $6)",
					[
						comicId,
						internalUserId,
						comicData.title,
						comicData.description,
						JSON.stringify(comicData.characters ?? null),
						JSON.stringify(comicData.setting ?? null),
					]
				);
				console.log(`New comic created with ID: ${comicId}.`);
			}

			// --- Process Pages and Panels ---
			// Iterate through pages provided in the request data
			for (const pageData of comicData.pages) {
				const pageId = crypto.randomUUID();
				await client.query(
					"INSERT INTO pages (page_id, comic_id, page_number) VALUES ($1, $2, $3)",
					[pageId, comicId, pageData.pageNumber]
				);
				console.log(
					`Created page number: ${pageData.pageNumber}, DB ID: ${pageId}`
				);

				// Iterate through panels within the current page
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

					console.log(
						`Uploading image for panel ${panelId} from temp URL: ${panelData.generatedImageUrl}`
					);
					const s3ImageUrl = await this.uploadImageToS3(
						panelData.generatedImageUrl,
						internalUserId,
						comicId,
						panelId
					);

					await client.query(
						"UPDATE panels SET image_url = $1, updated_at = NOW() WHERE panel_id = $2",
						[s3ImageUrl, panelId]
					);
					console.log(`Updated panel ${panelId} with S3 URL: ${s3ImageUrl}`);
				}
			}

			await client.query("COMMIT");
			console.log(
				`Successfully saved comic ${comicId}. Transaction committed.`
			);

			return { id: comicId, message: "Comic saved successfully" };
		} catch (error: any) {
			await client.query("ROLLBACK");
			console.error(
				`Error during saveComicWithPanels for comic ${
					existingComicId || "NEW"
				}. Rolling back transaction.`,
				error
			);
			throw new Error(`Failed to save comic: ${error.message}`);
		} finally {
			client.release();
			console.log(
				`Finished saveComicWithPanels attempt for comic ${
					existingComicId || "NEW"
				}. Client released.`
			);
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
				remainingContent = remainingContent.replace(dialogueMatch[0], "");
			}
			const description = remainingContent
				.replace(/Description:\s*/i, "")
				.replace(/^[A-Z\s0-9]+:\s*".*"$/gm, "")
				.replace(/\n+/g, " ")
				.trim();
			panels.push({ panelNumber, description, dialogue });
		}
		if (panels.length === 0 && script.trim().length > 0) {
			console.warn(
				"Script parsing did not find 'Panel X:'. Attempting direct parse."
			);
			const dialogue: Dialogue[] = [];
			let dialogueMatch;
			let remainingContent = script;
			dialogueRegex.lastIndex = 0;
			while ((dialogueMatch = dialogueRegex.exec(script)) !== null) {
				const character = dialogueMatch[1].trim();
				const text = dialogueMatch[2].trim();
				dialogue.push({ character, text });
				remainingContent = remainingContent.replace(dialogueMatch[0], "");
			}
			const description = remainingContent
				.replace(/Description:\s*/i, "")
				.replace(/^[A-Z\s0-9]+:\s*".*"$/gm, "")
				.trim();
			panels.push({ panelNumber: "1", description, dialogue });
		}
		return panels;
	}

	/**
	 * Retrieves a list of comics belonging to a specific user.
	 * @param internalUserId - The internal UUID of the user.
	 * @returns A promise that resolves to an array of ComicListItem objects.
	 */
	async listComicsByUser(internalUserId: string): Promise<ComicListItem[]> {
		console.log(`Workspaceing comics list for user: ${internalUserId}`);
		const query = `
                SELECT
                    comic_id,
                    title,
                    created_at,
                    updated_at
                FROM comics
                WHERE user_id = $1
                ORDER BY updated_at DESC;
            `;
		try {
			const result = await pool.query<ComicListItem>(query, [internalUserId]);
			console.log(
				`Found ${result.rowCount} comics for user ${internalUserId}.`
			);
			return result.rows;
		} catch (error: any) {
			console.error(`Error fetching comics for user ${internalUserId}:`, error);
			throw new Error("Failed to retrieve comics list.");
		}
	}

	/**
	 * Retrieves the full details of a specific comic, verifying ownership.
	 * @param comicId - The UUID of the comic to retrieve.
	 * @param internalUserId - The internal UUID of the requesting user.
	 * @returns A promise that resolves to the FullComicData object or null if not found/authorized.
	 */
	async getComicById(
		comicId: string,
		internalUserId: string
	): Promise<FullComicData | null> {
		console.log(
			`Workspaceing comic details for comic: ${comicId}, user: ${internalUserId}`
		);

		// Query to get comic, pages, and panels, ensuring ownership
		const query = `
            SELECT
                c.comic_id, c.title, c.description, c.characters, c.setting, c.created_at, c.updated_at,
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
				return null; // Comic not found or doesn't belong to the user
			}

			// Aggregate the results into a nested structure
			const comic: FullComicData = {
				comic_id: result.rows[0].comic_id,
				title: result.rows[0].title,
				description: result.rows[0].description || undefined,
				characters: result.rows[0].characters || undefined,
				setting: result.rows[0].setting || undefined,
				created_at: result.rows[0].created_at,
				updated_at: result.rows[0].updated_at,
				pages: [],
			};

			const pagesMap = new Map<string, FullPageData>();

			for (const row of result.rows) {
				if (!row.page_id) continue; // Skip if there are no pages/panels (comic exists but is empty)

				let page = pagesMap.get(row.page_id);
				if (!page) {
					page = {
						page_id: row.page_id,
						pageNumber: row.page_number,
						panels: [],
					};
					pagesMap.set(row.page_id, page);
					comic.pages.push(page); // Add in order
				}

				if (row.panel_id) {
					page.panels.push({
						panel_id: row.panel_id,
						panelNumber: row.panel_number,
						prompt: row.prompt,
						dialogue: row.dialogue || undefined,
						layoutPosition: row.layout_position || {},
						// Map image_url to generatedImageUrl for frontend compatibility if needed,
						// or adjust frontend to expect image_url
						generatedImageUrl: row.image_url, // Assuming frontend can use the S3 URL directly
						image_url: row.image_url, // Keep the final URL
					});
				}
			}

			// Sort pages just in case the DB didn't guarantee order perfectly
			comic.pages.sort((a, b) => a.pageNumber - b.pageNumber);
			// Sort panels within each page
			comic.pages.forEach((page) => {
				page.panels.sort((a, b) => a.panelNumber - b.panelNumber);
			});

			console.log(`Successfully fetched comic details for ${comicId}`);
			return comic;
		} catch (error: any) {
			console.error(`Error fetching comic ${comicId} details:`, error);
			throw new Error("Failed to retrieve comic details.");
		}
	}

	// --- Add other methods as needed ---
	// async deleteComic(comicId: string, userId: string): Promise<void> { /* ... DB logic + S3 cleanup ... */ }
}
