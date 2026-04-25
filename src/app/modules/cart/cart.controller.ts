import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { cartService } from "./cart.service";

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.getMyCart(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart retrieved successfully!",
    data: result,
  });
});

const addItem = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.addItem(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item added to cart successfully!",
    data: result,
  });
});

const updateItemQuantity = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.updateItemQuantity(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item updated successfully!",
    data: result,
  });
});

const removeItem = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.removeItem(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item removed successfully!",
    data: result,
  });
});

const clearMyCart = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.clearMyCart(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart cleared successfully!",
    data: result,
  });
});

const mergeGuestCart = catchAsync(async (req: Request, res: Response) => {
  const result = await cartService.mergeGuestCart(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guest cart merged successfully!",
    data: result,
  });
});

export const cartController = {
  getMyCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearMyCart,
  mergeGuestCart,
};
