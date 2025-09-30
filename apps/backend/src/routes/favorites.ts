import express from "express";
import { API_ROUTES } from "@repo/common-types";
import { authenticateToken } from "../middleware/auth.middleware";
import { favoritesController } from "../controllers/favorites.controller";

const router = express.Router();
const { FAVORITES } = API_ROUTES;

router.use(express.json());

router.get(
	FAVORITES.BASE,
	authenticateToken,
	favoritesController.getFavoriteComics.bind(favoritesController)
);
router.post(
	FAVORITES.BASE,
	authenticateToken,
	favoritesController.addFavoriteComic.bind(favoritesController)
);
router.delete(
	FAVORITES.BY_ID(":comicId"),
	authenticateToken,
	favoritesController.removeFavoriteComic.bind(favoritesController)
);

export default router;
