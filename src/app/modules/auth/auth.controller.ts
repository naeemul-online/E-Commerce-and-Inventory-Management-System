import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { cookieHelpers } from "../../../utils/cookieHelpers";
import { authService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req);

  /* JWT SETUP FOLLOW
  1. Declare jwt env
  2. Generate Tokens in the service layer (Uses jwt helpers fn)
  - generate access and refresh token
  - store access token on database
  3. Set Auth in the controller layer (Uses cookie helper fn)
  */

  cookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully!",
    data: result,
  });
});

/* Log In */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req);

  cookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully!",
    data: result,
  });
});

/* Guest Login */
const guestLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.guestLogin(req);

  cookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully!",
    data: result,
  });
});
/* Guest Login */
const setPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.setPassword(req);

  cookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully!",
    data: result,
  });
});

/**
 * Logout
 */
const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logoutUser(refreshToken || req.cookies.refreshToken);

  // Clear cookies
  cookieHelpers.clearAuthCookies(res);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

/**
 * Refresh Token
 */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  const result = await authService.refreshAccessToken(
    token || req.cookies.refreshToken,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

/**
 * Get Profile (Protected)
 */
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getUserProfile(req.user!.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
});

export const authController = {
  login,
  guestLogin,
  getProfile,
  logout,
  register,
  refreshToken,
  setPassword,
};
