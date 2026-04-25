import { Role } from "@prisma/client";
import express from "express";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { cartController } from "./cart.controller";
import { CartValidation } from "./cart.validation";

const router = express.Router();

router.use(auth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN));

router.get("/", validateRequest(CartValidation.getCart), cartController.getMyCart);

router.post(
  "/items",
  validateRequest(CartValidation.addItem),
  cartController.addItem,
);

router.patch(
  "/items/:itemId",
  validateRequest(CartValidation.updateItemQuantity),
  cartController.updateItemQuantity,
);

router.delete(
  "/items/:itemId",
  validateRequest(CartValidation.removeItem),
  cartController.removeItem,
);

router.delete("/clear", validateRequest(CartValidation.clearCart), cartController.clearMyCart);

router.post(
  "/merge",
  validateRequest(CartValidation.mergeGuestCart),
  cartController.mergeGuestCart,
);

export const cartRoutes = router;
