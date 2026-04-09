import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.login),
  authController.login,
);

router.post(
  "/register",
  validateRequest(AuthValidation.register),
  authController.register,
);

router.post(
  "/set-password",
  validateRequest(AuthValidation.setPassword),
  authController.setPassword,
);

router.post("/logout", authController.logout);

export const authRoutes = router;
