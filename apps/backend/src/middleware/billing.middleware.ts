import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { adminService } from "../services/admin.service";
import { stripeService } from "../services/stripe.service";
import { ErrorFactory } from "@repo/common-types";

export const checkPanelBalance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const internalUserId = req.internalUserId;
    if (!internalUserId) {
      throw ErrorFactory.unauthorized("User ID not found in request");
    }

    const isAdmin = await adminService.isAdmin(internalUserId);
    if (isAdmin) {
      return next();
    }

    const hasSufficientCredits = await stripeService.hasSufficientCredits(
      internalUserId
    );
    if (!hasSufficientCredits) {
      throw ErrorFactory.paymentRequired("Insufficient credits");
    }

    next();
  } catch (error) {
    next(error);
  }
};
