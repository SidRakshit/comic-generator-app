import pool from "../database";

class UserService {
  async getUserCredits(userId: string): Promise<{ panel_balance: number } | null> {
    const result = await pool.query(
      "SELECT panel_balance FROM user_credits WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }
}

export const userService = new UserService();