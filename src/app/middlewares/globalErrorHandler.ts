import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod"; // 1. Import ZodError

const sanitizeError = (error: any) => {
  if (process.env.NODE_ENV === "production" && error.code?.startsWith("P")) {
    return {
      message: "Database operation failed",
      errorDetails: null,
    };
  }
  return error;
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log({ err }); // Keep for debugging

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let success: boolean = false;
  let message: string = err.message || "Something went wrong!";
  let error: any = err;

  // 2. Handle Zod Errors specifically
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";

    // Map the errors into a clean array for the frontend
    error = err.issues.map((issue) => {
      return {
        field: issue.path[issue.path.length - 1], // e.g., "phone"
        message: issue.message,
      };
    });
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error";
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate Key error";
      error = err.meta;
    }
  }

  const sanitizedError = error;

  res.status(statusCode).json({
    success,
    message,
    error: sanitizedError,
  });
};

export default globalErrorHandler;
