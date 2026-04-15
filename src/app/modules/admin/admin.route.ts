import { Role } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { adminController } from "./admin.controller";
const router = express.Router();

// public route
router.get("/users", auth(Role.SUPER_ADMIN, Role.ADMIN), adminController.allUsers);

export const adminRoutes = router;
