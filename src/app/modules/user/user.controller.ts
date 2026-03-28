import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { setAuthCookie } from "../../../utils/setAuthCookie";
import { userService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUser(req);

  // 🔥 SAME LOGIC AS LOGIN
  if (result?.accessToken) {
    setAuthCookie(res, result.accessToken);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Created successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Updated successfully!",
    data: result,
  });
});

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.allUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All User Retrieved successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Deleted successfully!",
    data: result,
  });
});

export const userController = {
  createUser,
  updateUser,
  allUsers,
  deleteUser,
};
