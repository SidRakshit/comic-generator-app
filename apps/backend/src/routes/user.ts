// backend/src/routes/user.ts
import express from "express";
import pool from "../database";
import { authenticateToken } from "../middleware/auth.middleware";
import { userController } from "../controllers/user.controller";
import { API_ROUTES } from "@repo/common-types";

const router = express.Router();
const { USERS } = API_ROUTES;

router.get(
	USERS.ME_CREDITS,
	authenticateToken,
	userController.getUserCredits.bind(userController)
);

// Delete user account
router.delete(
	USERS.DELETE_ACCOUNT,
	authenticateToken,
	userController.deleteAccount.bind(userController)
);

// Get user by ID
router.get(USERS.BY_ID(':id'), authenticateToken, (req, res) => {
	const id = parseInt(req.params.id);

	pool
		.query("SELECT * FROM users WHERE id = $1", [id])
		.then((result: { rows: string | any[] }) => {
			if (result.rows.length === 0) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json(result.rows[0]);
		})
		.catch((error: any) => {
			console.error("Error executing query", error);
			res.status(500).json({ message: "Error fetching user" });
		});
});

// Get all users
router.get(USERS.BASE, authenticateToken, (req, res) => {
	pool
		.query("SELECT * FROM users")
		.then((result: { rows: any }) => {
			res.json(result.rows);
		})
		.catch((error: any) => {
			console.error("Error executing query", error);
			res.status(500).json({ message: "Error fetching users" });
		});
});

export default router;
