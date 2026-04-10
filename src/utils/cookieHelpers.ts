import config from "../config";

import { Response } from "express";

const isProduction = config.env === "production";

export const cookieHelpers = {
  /* Set access token (short lived)*/

  /**
   * Set access token cookie (short-lived)
   */
  setAccessTokenCookie(res: Response, token: string) {
    res.cookie("accessToken", token, {
      httpOnly: true, // ✅ XSS protection
      secure: isProduction, // ✅ HTTPS only in production
      sameSite: "strict", // ✅ CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 day (must match JWT_EXPIRES_IN)
      path: "/",
    });
  },

  /**
   * Set refresh token cookie (long-lived)
   */
  setRefreshTokenCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (must match JWT_REFRESH_EXPIRES_IN)
      path: "/",
    });
  },

  /**
   * Set both cookies
   */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  },

  /**
   * Clear authentication cookies
   */
  clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
  },
};
