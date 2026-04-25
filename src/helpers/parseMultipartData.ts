import express from "express";
import httpStatus from "http-status";

import ApiError from "../app/errors/ApiError";

export const parseMultipartData = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const rawData = req.body?.data;

    if (typeof rawData === "string") {
      req.body = JSON.parse(rawData);
    }

    next();
  } catch {
    next(
      new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON in form-data field 'data'"),
    );
  }
};
