// src/controllers/comics.controller.ts
import { Request, Response } from "express";
import { ComicService } from "../services/comics.service";
import { AuthenticatedRequestFields, CreateComicRequest, ErrorFactory } from "@repo/common-types";
import { asyncHandler } from "../middleware/error.middleware";

// Create the final AuthenticatedRequest type by intersecting Express Request with our fields
type AuthenticatedRequest = Request & AuthenticatedRequestFields;

export class ComicController {
	private comicService: ComicService;

	constructor() {
		this.comicService = new ComicService();
		this.generateImage = this.generateImage.bind(this);
		this.saveComic = this.saveComic.bind(this);
		this.listComics = this.listComics.bind(this);
		this.getComic = this.getComic.bind(this);
		this.deleteComic = this.deleteComic.bind(this);
	}


	generateImage = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
		// Request body is already validated by middleware
		const { panelDescription, characterContext, dialogue, imageFiles, imageMimeTypes } = req.body;
		const internalUserId = req.internalUserId;
		if (!internalUserId) {
			throw ErrorFactory.unauthorized("User ID not found in request");
		}
		
		const panelImage = await this.comicService.generatePanelImage(internalUserId, panelDescription, characterContext, dialogue, imageFiles, imageMimeTypes);
		res.status(200).json(panelImage);
	});

	/**
	 * Handles requests to save (create or update) a comic.
	 */
	saveComic = asyncHandler(async (
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> => {
		const internalUserId = req.internalUserId;
		if (!internalUserId) {
			throw ErrorFactory.unauthorized("User ID not found in request");
		}

		// Request body is already validated by middleware - no manual validation needed
		const comicData: CreateComicRequest = req.body;
		const { comicId } = req.params;

		console.log(
			`Controller: saveComic called by user ${internalUserId}. Existing comicId: ${comicId}`
		);

		const result = await this.comicService.saveComicWithPanelsFromApi(
			internalUserId,
			comicData,
			comicId // Pass undefined if it's a new comic (POST)
		);

		if (!result) {
			throw ErrorFactory.notFound("Comic", comicId);
		}

		const statusCode = comicId ? 200 : 201;
		res.status(statusCode).json(result);
	});

	/**
	 * Handles requests to list comics for the authenticated user.
	 */
	listComics = async (
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> => {
		try {
			const internalUserId = req.internalUserId;
			if (!internalUserId) {
				res
					.status(401)
					.json({ error: "Unauthorized: User ID not found in request." });
				return;
			}

			console.log(`Controller: listComics called by user ${internalUserId}`);
			const comics = await this.comicService.listComicsByUser(internalUserId);
			res.status(200).json(comics);
		} catch (error: any) {
			console.error("Error in listComics controller:", error.message);
			res
				.status(500)
				.json({ error: error.message || "Failed to retrieve comics list." });
		}
	};

	/**
	 * Handles requests to get a specific comic by ID for the authenticated user.
	 */
	getComic = async (
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> => {
		try {
			const internalUserId = req.internalUserId;
			if (!internalUserId) {
				res
					.status(401)
					.json({ error: "Unauthorized: User ID not found in request." });
				return;
			}

			const { comicId } = req.params;
			if (!comicId) {
				res.status(400).json({ error: "Bad Request: Comic ID is required." });
				return;
			}

			console.log(
				`Controller: getComic called by user ${internalUserId} for comic ${comicId}`
			);
			const comic = await this.comicService.getComicById(
				comicId,
				internalUserId
			);

			if (!comic) {
				res.status(404).json({ error: "Comic not found or access denied." });
				return;
			}

			res.status(200).json(comic);
		} catch (error: any) {
			console.error(
				`Error in getComic controller for comic ${req.params.comicId}:`,
				error.message
			);
			res
				.status(500)
				.json({ error: error.message || "Failed to retrieve comic details." });
		}
	};

	/**
	 * Handles requests to delete a specific comic by ID for the authenticated user.
	 */
	deleteComic = asyncHandler(async (
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> => {
		const internalUserId = req.internalUserId;
		if (!internalUserId) {
			throw ErrorFactory.unauthorized("User ID not found in request");
		}

		const { comicId } = req.params;
		if (!comicId) {
			throw ErrorFactory.invalidInput("Comic ID is required", "comicId");
		}

		console.log(
			`Controller: deleteComic called by user ${internalUserId} for comic ${comicId}`
		);

		const success = await this.comicService.deleteComic(comicId, internalUserId);
		
		if (!success) {
			throw ErrorFactory.notFound("Comic", comicId);
		}

		res.status(200).json({ message: "Comic deleted successfully" });
	});

}

export const comicController = new ComicController();