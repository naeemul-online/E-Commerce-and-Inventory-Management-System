import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminService } from "./admin.service";

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.allUsers(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});

export const adminController = { allUsers };
