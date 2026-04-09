import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelpers } from "../../utils/jwtHelpers";
import ApiError from "../errors/ApiError";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let token = "";
      console.log("Authorization:", req.headers.authorization);
      console.log("Cookies:", req.cookies);
      if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }

      console.log({ token }, "from auth guard");

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(req.user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
