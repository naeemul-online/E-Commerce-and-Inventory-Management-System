import express from "express";

import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { UserValidation } from "./user.validation";
const router = express.Router();

router.post(
  "/register",
  validateRequest(UserValidation.register),
  userController.createUser,
);
router.patch("/update/:id", auth(Role.USER), userController.updateUser);
router.get("/", auth(Role.ADMIN), userController.allUsers);
// soft delete
router.patch("/delete/:id", auth(Role.ADMIN), userController.deleteUser);

export const userRoutes = router;
