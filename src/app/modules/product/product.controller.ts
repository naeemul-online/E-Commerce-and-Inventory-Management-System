import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { productService } from "./product.service";

// CREATE
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.createProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product created successfully!",
    data: result,
  });
});

// GET ALL
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const searchProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.searchProducts(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products search results retrieved successfully!",
    data: result,
  });
});

// GET SINGLE
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getSingleProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully!",
    data: result,
  });
});

// UPDATE
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.updateProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully!",
    data: result,
  });
});

// DELETE
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully!",
    data: null,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
