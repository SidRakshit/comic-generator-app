// backend/src/routes/index.ts

import express from "express";
import comicRoutes from "./comics";
import userRoutes from "./user";
import adminRoutes from "./admin";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/", comicRoutes);
router.use("/", userRoutes);

router.get("/", (req, res) => {
	res.json({ message: "API is running!" });
});

export default router;
