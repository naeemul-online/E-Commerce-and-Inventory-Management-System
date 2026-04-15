import { Role } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
const router = express.Router();

// public route
router.post(
  "/register",
  validateRequest(AuthValidation.register),
  authController.register,
);

router.post(
  "/login",
  validateRequest(AuthValidation.login),
  authController.login,
);

router.post(
  "/guest-login",
  validateRequest(AuthValidation.guest),
  authController.guestLogin,
);

router.post(
  "/set-password",
  validateRequest(AuthValidation.setPassword),
  authController.setPassword,
);

router.post("/logout", authController.logout);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshToken),
  authController.refreshToken,
);
router.get(
  "/profile",
  auth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  authController.getProfile,
);

export const authRoutes = router;
