import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { adminServices } from "./admin.services";

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.allUsers(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result,
  });
});

export const adminController = { allUsers };
