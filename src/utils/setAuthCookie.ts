// utils/setAuthCookie.ts
import { Response } from "express";
import config from "../config";

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};
