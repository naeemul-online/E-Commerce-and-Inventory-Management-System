// utils/setAuthCookie.ts
import { Response } from "express";
import config from "../config";

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
