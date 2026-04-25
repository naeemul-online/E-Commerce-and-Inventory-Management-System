import { Role } from "@prisma/client";
import express from "express";

import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/fileUpload";
import validateRequest from "../../middlewares/validateRequest";
import { parseMultipartData } from "../../../helpers/parseMultipartData";

import { brandController } from "./brand.controller";
import { BrandValidation } from "./brand.validation";

const router = express.Router();

// CREATE
router.post(
  "/",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  upload.single("image"),
  parseMultipartData,
  validateRequest(BrandValidation.create),
  brandController.createBrand,
);

// GET ALL
router.get("/", brandController.getAllBrands);

// GET SINGLE
router.get(
  "/:id",

  validateRequest(BrandValidation.getSingle),
  brandController.getSingleBrand,
);

// UPDATE
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  upload.single("image"),
  parseMultipartData,
  validateRequest(BrandValidation.update),
  brandController.updateBrand,
);

// DELETE
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(BrandValidation.delete),
  brandController.deleteBrand,
);

export const brandRoutes = router;
