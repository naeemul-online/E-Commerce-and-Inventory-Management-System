import express from "express";

import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import { userController } from "./brand.controller";
const router = express.Router();

router.patch("/update/:id", auth(Role.USER), userController.updateUser);

export const userRoutes = router;
