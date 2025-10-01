import { Request, Response } from "express";
import { AuthenticatedRequestFields, DeleteAccountRequest } from "@repo/common-types";
import { userService } from "../services/user.service";

type UserRequest = Request & AuthenticatedRequestFields;

class UserController {
  async getUserCredits(req: UserRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const credits = await userService.getUserCredits(internalUserId);
      res.status(200).json(credits);
    } catch (error) {
      console.error("Failed to get user credits", error);
      res.status(500).json({ error: "Failed to get user credits" });
    }
  }

  async deleteAccount(req: UserRequest, res: Response): Promise<void> {
    try {
      const internalUserId = req.internalUserId;
      if (!internalUserId) {
        res.status(401).json({ error: "User context missing" });
        return;
      }

      const { confirmation }: DeleteAccountRequest = req.body;
      
      // Validate confirmation
      if (confirmation !== "DELETE") {
        res.status(400).json({ 
          error: "Invalid confirmation. Please type 'DELETE' to confirm account deletion." 
        });
        return;
      }

      await userService.deleteUserAccount(internalUserId);
      
      res.status(200).json({ 
        message: "Account successfully deleted. You will be logged out." 
      });
    } catch (error) {
      console.error("Failed to delete user account", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  }
}

export const userController = new UserController();
