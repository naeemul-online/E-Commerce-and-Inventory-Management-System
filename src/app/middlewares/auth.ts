import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { jwtHelpers } from "../../utils/jwtHelpers";
import ApiError from "../errors/ApiError";

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        phone?: string;
      };
    }
  }
}

/**
 * Auth middleware - verifies JWT and attaches user to request
 * @param requiredRoles - optional roles for authorization (e.g., "ADMIN", "USER")
 */
export const auth = (...requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract token from headers or cookies
      let token = "";

      if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies?.accessToken;
      }

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authenticated. Please login first.",
        );
      }

      // 2. Verify token
      const decoded = jwtHelpers.verifyAccessToken(token);

      req.user = decoded;

      // 3. Check role-based authorization
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, `You are not authorized!`);
      }

      // 4. Role Authorization
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Forbidden: Required role: ${requiredRoles.join(", ")}`,
        );
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else if (error instanceof Error && error.message.includes("jwt")) {
        next(
          new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid or expired token. Please login again.",
          ),
        );
      } else {
        next(error);
      }
    }
  };
};

export default auth;

// const auth = (...roles: string[]) => {
//   return async (
//     req: Request & { user?: any },
//     res: Response,
//     next: NextFunction,
//   ) => {
//     try {
//       let token = "";
//       console.log("Authorization:", req.headers.authorization);
//       console.log("Cookies:", req.cookies);
//       if (req.headers.authorization) {
//         token = req.headers.authorization.split(" ")[1];
//       } else if (req.cookies.accessToken) {
//         token = req.cookies.accessToken;
//       }

//       console.log({ token }, "from auth guard");

//       if (!token) {
//         throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
//       }

//       const verifiedUser = jwtHelpers.verifyAccessToken(token);

//       req.user = verifiedUser;

//       if (roles.length && !roles.includes(req.user.role)) {
//         throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
//       }
//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };
