import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { favoritesController } from "../controllers/favorites.controller";

const router = express.Router();

router.use(express.json());

router.get("/favorites", authenticateToken, favoritesController.getFavoriteComics.bind(favoritesController));
router.post("/favorites", authenticateToken, favoritesController.addFavoriteComic.bind(favoritesController));
router.delete("/favorites/:comicId", authenticateToken, favoritesController.removeFavoriteComic.bind(favoritesController));

export default router;
