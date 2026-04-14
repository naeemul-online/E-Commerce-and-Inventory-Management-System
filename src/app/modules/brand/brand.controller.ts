import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { brandService } from "./brand.service";

// CREATE
const createBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.createBrand(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand created successfully!",
    data: result,
  });
});

// GET ALL
const getAllBrands = catchAsync(async (_req: Request, res: Response) => {
  const result = await brandService.getAllBrands();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brands retrieved successfully!",
    data: result,
  });
});

// GET SINGLE
const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.getSingleBrand(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand retrieved successfully!",
    data: result,
  });
});

// UPDATE
const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.updateBrand(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand updated successfully!",
    data: result,
  });
});

// DELETE
const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  await brandService.deleteBrand(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand deleted successfully!",
    data: null,
  });
});

export const brandController = {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};
