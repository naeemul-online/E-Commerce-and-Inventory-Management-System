import { Role } from "@prisma/client";
import express from "express";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";

import { categoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";

const router = express.Router();

// CREATE
router.post(
  "/",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CategoryValidation.create),
  categoryController.createCategory,
);

// GET ALL (no validation needed)
router.get("/", categoryController.getAllCategories);

// GET SINGLE
router.get(
  "/:id",
  validateRequest(CategoryValidation.getSingle),
  categoryController.getSingleCategory,
);

// UPDATE
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CategoryValidation.update),
  categoryController.updateCategory,
);

// DELETE
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(CategoryValidation.delete),
  categoryController.deleteCategory,
);

export const categoryRoutes = router;
