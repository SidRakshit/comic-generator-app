// src/services/comics.service.ts

// --- Core Dependencies ---
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import axios from "axios";
import crypto from "crypto";
import { PoolClient } from "pg";
import {
  s3Client,
  S3_BUCKET_NAME,
  OPENAI_API_KEY,
  AWS_REGION,
} from "../config";

// --- Database Pool Import ---
import pool from "../database";

// --- Shared Types ---
import { Dialogue, ScriptPanel, GeneratedImageData } from "@repo/common-types";

// --- Panels, Pages, Comics Before Saving ---
interface PanelDataFromRequest {
  panelNumber: number;
  prompt: string;
  dialogue?: string;
  layoutPosition: object;
  imageBase64: string; // Expect base64 data from frontend
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

// --- Panels, Pages, Comics After Saving ---
interface FullPageData extends Omit<PageDataFromRequest, "panels"> {
  page_id: string;
  panels: FullPanelData[];
}
interface FullPanelData extends Omit<PanelDataFromRequest, "imageBase64"> {
  panel_id: string;
  image_url: string; // Final S3 URL
}
interface FullComicData extends Omit<ComicDataFromRequest, "pages"> {
  comic_id: string;
  created_at: Date;
  updated_at: Date;
  pages: FullPageData[];
}

// Summarized version of a comic's data
interface ComicListItem {
  comic_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

// --- Comic Service Class ---
export class ComicService {
  // --- OpenAI Interaction Methods ---

  async generateSinglePanelScript(prompt: string): Promise<ScriptPanel | null> {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured.");
    }
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt cannot be empty.");
    }
    console.log(`Generating script for single panel prompt: "${prompt}"`);
    try {
      const storyResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
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
      const panels = this.parseComicScript(`Panel 1: ${panelContent}`);
      console.log("Parsed single panel:", panels);
      return panels.length > 0 ? panels[0] : null;
    } catch (error: any) {
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
   * Generates base64 encoded image data for a given panel description using OpenAI.
   * Handles both b64_json and url responses from the API, always returning base64.
   * Includes enhanced logging for debugging OpenAI API calls.
   * @param panelDescription Text description of the panel scene.
   * @returns A promise that resolves to a GeneratedImageData object containing the base64 string.
   */
  async generatePanelImage(
    panelDescription: string
  ): Promise<GeneratedImageData> {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured.");
    }
    if (!panelDescription || panelDescription.trim() === "") {
      throw new Error("Panel description cannot be empty.");
    }
    console.log(`Generating image for description: "${panelDescription}"`);

    // --- Use the model you specified ---
    const modelToUse = "gpt-image-1";
    const size = "1024x1024";

    try {
      const fullPrompt = `Comic book panel illustration: ${panelDescription}. Style: vibrant, detailed.`;

      // Prepare the request payload
      const requestPayload = {
        model: modelToUse,
        prompt: fullPrompt,
        size: size,
        quality: "low",
        moderation: "low",
      };

      // --- ADDED LOGGING: Log the request payload ---
      console.log(
        "Sending payload to OpenAI:",
        JSON.stringify(requestPayload, null, 2)
      );

      const imageResponse = await axios.post(
        "https://api.openai.com/v1/images/generations",
        requestPayload, // Use the payload object
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let imageDataBase64: string | null = null;
      const responseData = imageResponse.data.data[0];

      if (responseData?.b64_json) {
        console.log("Received b64_json from OpenAI.");
        imageDataBase64 = responseData.b64_json;
      } else if (responseData?.url) {
        console.log(
          `Received URL from OpenAI: ${responseData.url}. Downloading...`
        );
        const imageUrl = responseData.url;
        try {
          const downloadResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
          });
          if (downloadResponse.status !== 200) {
            throw new Error(
              `Failed to download image from URL ${imageUrl}. Status: ${downloadResponse.status}`
            );
          }
          const imageBuffer: Buffer = downloadResponse.data;
          imageDataBase64 = imageBuffer.toString("base64");
          console.log(
            "Successfully downloaded and converted image URL to base64."
          );
        } catch (downloadError: any) {
          console.error(
            `Error downloading image from URL ${imageUrl}:`,
            downloadError.message
          );
          throw new Error(
            `Failed to download image from provided URL: ${downloadError.message}`
          );
        }
      }

      if (!imageDataBase64) {
        console.error(
          "OpenAI response format not recognized or missing data:",
          imageResponse.data
        );
        throw new Error(
          "Failed to get image data (b64_json or url) from OpenAI response."
        );
      }

      console.log(
        "Image data prepared (first 50 chars):",
        imageDataBase64.substring(0, 50) + "..."
      );
      return { imageData: imageDataBase64, promptUsed: fullPrompt };
    } catch (error: any) {
      // --- ENHANCED LOGGING in CATCH block ---
      console.error(
        "Error calling OpenAI for image generation or processing response. Status:",
        error.response?.status // Log status code if available
      );
      // Log the detailed error response body from OpenAI if available
      console.error(
        "OpenAI Error Response Body:",
        JSON.stringify(error.response?.data, null, 2) // Log the full JSON error
      );

      // Keep specific error checks
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
      // Check if the error occurred during download (keep this check)
      if (error.message.includes("Failed to download image")) {
        throw error; // Re-throw download-specific error
      }

      // Construct a more informative general error message
      const statusText = error.response?.status
        ? ` (Status ${error.response.status})`
        : "";
      // Try to get the specific error message from OpenAI's response data
      const openAIErrorMessage =
        error.response?.data?.error?.message || error.message;
      throw new Error(
        `Failed to generate or process panel image from OpenAI${statusText}: ${openAIErrorMessage}`
      );
    }
  }

  /**
   * Uploads image data (from base64 string) to S3.
   * @param imageDataBase64 The base64 encoded image data.
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

      const s3Key = `users/${userId}/comics/${comicId}/panels/${panelId}.${fileExtension}`;
      console.log(`Uploading image to S3 bucket: ${S3_BUCKET_NAME}, Key: ${s3Key}`);

      const putObjectParams = {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: imageData,
        ContentType: contentType,
        ACL: "public-read" as ObjectCannedACL,
      };
      const command = new PutObjectCommand(putObjectParams);
      await s3Client.send(command);

      const s3Url = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
      console.log(`Successfully uploaded image to: ${s3Url}`);
      return s3Url;
    } catch (error: any) {
      console.error("Error in uploadImageToS3:", error);
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

  async listComicsByUser(internalUserId: string): Promise<ComicListItem[]> {
    console.log(`Listing comics list for user: ${internalUserId}`);
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
      console.log(`Found ${result.rowCount} comics for user ${internalUserId}.`);
      return result.rows;
    } catch (error: any) {
      console.error(`Error fetching comics for user ${internalUserId}:`, error);
      throw new Error("Failed to retrieve comics list.");
    }
  }

  async getComicById(
    comicId: string,
    internalUserId: string
  ): Promise<FullComicData | null> {
    console.log(
      `Fetching comic details for comic: ${comicId}, user: ${internalUserId}`
    );
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
        return null;
      }

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
        if (!row.page_id) continue;

        let page = pagesMap.get(row.page_id);
        if (!page) {
          page = {
            page_id: row.page_id,
            pageNumber: row.page_number,
            panels: [],
          };
          pagesMap.set(row.page_id, page);
          comic.pages.push(page);
        }

        if (row.panel_id) {
          page.panels.push({
            panel_id: row.panel_id,
            panelNumber: row.panel_number,
            prompt: row.prompt,
            dialogue: row.dialogue || undefined,
            layoutPosition: row.layout_position || {},
            image_url: row.image_url,
          });
        }
      }

      // Sort pages and panels after processing all rows
      comic.pages.sort((a, b) => a.pageNumber - b.pageNumber);
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
} // End of ComicService class