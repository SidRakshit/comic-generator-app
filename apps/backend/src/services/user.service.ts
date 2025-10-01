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

  async deleteUserAccount(userId: string): Promise<void> {
    // Start a transaction to ensure all related data is deleted
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete user-related data in the correct order to respect foreign key constraints
      // The database schema has CASCADE DELETE for most relationships, but we'll be explicit
      
      // Delete user favorites
      await client.query('DELETE FROM user_favorite_comics WHERE user_id = $1', [userId]);
      
      // Delete panel usage logs
      await client.query('DELETE FROM panel_usage_log WHERE user_id = $1', [userId]);
      
      // Delete credit purchases
      await client.query('DELETE FROM credit_purchases WHERE user_id = $1', [userId]);
      
      // Delete user credits
      await client.query('DELETE FROM user_credits WHERE user_id = $1', [userId]);
      
      // Delete user profile
      await client.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
      
      // Delete comics (this will cascade to panels due to foreign key constraints)
      await client.query('DELETE FROM comics WHERE user_id = $1', [userId]);
      
      // Delete admin-related data if user is an admin
      await client.query('DELETE FROM admin_audit_logs WHERE admin_user_id = $1', [userId]);
      await client.query('DELETE FROM admin_impersonation_tokens WHERE admin_user_id = $1 OR target_user_id = $1', [userId, userId]);
      await client.query('DELETE FROM admin_mfa_enrollments WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM admin_users WHERE user_id = $1', [userId]);
      
      // Finally, delete the user record
      await client.query('DELETE FROM users WHERE user_id = $1', [userId]);
      
      await client.query('COMMIT');
      
      console.log(`Successfully deleted user account: ${userId}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user account:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const userService = new UserService();