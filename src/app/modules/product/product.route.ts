import { Role } from "@prisma/client";
import express from "express";

import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/fileUpload";
import { searchLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { parseMultipartData } from "../../../helpers/parseMultipartData";

import { productController } from "./product.controller";
import { ProductValidation } from "./product.validation";

const router = express.Router();

// CREATE
router.post(
  "/",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  upload.array("images", 6),
  parseMultipartData,
  validateRequest(ProductValidation.create),
  productController.createProduct,
);

// GET ALL
router.get("/", productController.getAllProducts);

// SEARCH
router.get(
  "/search",
  searchLimiter,
  validateRequest(ProductValidation.search),
  productController.searchProducts,
);

// GET SINGLE
router.get(
  "/:id",
  validateRequest(ProductValidation.getSingle),
  productController.getSingleProduct,
);

// UPDATE
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  upload.array("images", 6),
  parseMultipartData,
  validateRequest(ProductValidation.update),
  productController.updateProduct,
);

// DELETE
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(ProductValidation.delete),
  productController.deleteProduct,
);

export const productRoutes = router;
