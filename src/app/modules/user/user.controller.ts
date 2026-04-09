import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.service";

/* JWT: accessToken, refreshToken setup
1. 
*/

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Updated successfully!",
    data: result,
  });
});

export const userController = {
  updateUser,
};
