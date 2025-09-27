// backend/src/routes/user.ts
import express from "express";
import pool from "../database";
import { authenticateToken } from "../middleware/auth.middleware";
import { adminService } from "../services/admin.service";

const router = express.Router();

router.get("/users/me/credits", authenticateToken, async (req: any, res) => {
  try {
    const internalUserId = req.internalUserId;
    if (!internalUserId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const summary = await adminService.getUserCredits(internalUserId);
    res.json(
      summary ?? {
        user_id: internalUserId,
        panel_balance: 0,
        last_purchased_at: null,
      }
    );
  } catch (error) {
    console.error("Failed to fetch user credits", error);
    res.status(500).json({ error: "Failed to load credits" });
  }
});

// Get user by ID
router.get("/users/:id", authenticateToken, (req, res) => {
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
router.get("/users", authenticateToken, (req, res) => {
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