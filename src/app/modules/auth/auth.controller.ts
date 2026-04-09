import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { setAuthCookie } from "../../../utils/setAuthCookie";
import { authService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);

  const result = await authService.registerUser(req);

  if (result.accessToken) {
    setAuthCookie(res, result.accessToken);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully!",
    data: result,
  });
});
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req);

  if (result.accessToken) {
    setAuthCookie(res, result.accessToken);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully!",
    data: result,
  });
});

const setPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.setPassword(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password set successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You are logged out successfully!",
    data: null,
  });
});

export const authController = {
  login,
  setPassword,
  logout,
  register,
};
