// src/models/user.model.ts
import pool from "../database";

export interface User {
	id: number;
	username: string;
	email: string;
	created_at: Date;
}

export class UserModel {
	static async findAll(): Promise<User[]> {
		try {
			const result = await pool.query("SELECT * FROM users");
			return result.rows;
		} catch (error) {
			console.error("Error fetching users:", error);
			throw error;
		}
	}

	static async findById(id: number): Promise<User | null> {
		try {
			const result = await pool.query("SELECT * FROM users WHERE id = $1", [
				id,
			]);
			return result.rows[0] || null;
		} catch (error) {
			console.error(`Error fetching user with id ${id}:`, error);
			throw error;
		}
	}

	// Add more methods as needed
}
