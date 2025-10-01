import { Request, Response } from "express";
import type { AuthenticatedRequestFields } from "@repo/common-types";
import { favoritesService } from "../services/favorites.service";

export type FavoritesRequest = Request & AuthenticatedRequestFields;

export class FavoritesController {
  async getFavoriteComics(req: FavoritesRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const favorites = await favoritesService.getFavoriteComics(internalUserId);
      res.status(200).json(favorites);
    } catch (error) {
      console.error("Failed to get favorite comics", error);
      res.status(500).json({ error: "Failed to get favorite comics" });
    }
  }

  async addFavoriteComic(req: FavoritesRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const { comicId } = req.body;
      if (!comicId) {
        res.status(400).json({ error: "comicId is required" });
        return;
      }

      await favoritesService.addFavoriteComic(internalUserId, comicId);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to add favorite comic", error);
      res.status(500).json({ error: "Failed to add favorite comic" });
    }
  }

  async removeFavoriteComic(req: FavoritesRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const { comicId } = req.params;
      if (!comicId) {
        res.status(400).json({ error: "comicId is required" });
        return;
      }

      await favoritesService.removeFavoriteComic(internalUserId, comicId);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to remove favorite comic", error);
      res.status(500).json({ error: "Failed to remove favorite comic" });
    }
  }
}

export const favoritesController = new FavoritesController();