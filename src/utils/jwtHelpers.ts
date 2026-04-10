import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config";

export interface JWTPayload {
  id: string;
  role: string;
  phone?: string;
  iat?: string;
  exp?: string;
}

export const jwtHelpers = {
  /* Generate access token */

  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(
      payload,
      config.jwt.jwt_secret as Secret,
      {
        algorithm: "HS256",
        expiresIn: config.jwt.jwt_expires_in,
      } as SignOptions,
    );
  },

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(
      payload,
      config.jwt.refresh_token_secret as Secret,
      {
        algorithm: "HS256",
        expiresIn: config.jwt.refresh_token_expires_in,
      } as SignOptions,
    );
  },

  /**
   * Generate both tokens
   */
  generateTokens(payload: JWTPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwt.jwt_secret as Secret) as JWTPayload;
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(
      token,
      config.jwt.refresh_token_secret as Secret,
    ) as JWTPayload;
  },

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  },
};

// const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
//   const token = jwt.sign(payload, secret, {
//     algorithm: "HS256",
//     expiresIn,
//   } as SignOptions);

//   return token;
// };

// const verifyToken = (token: string, secret: Secret) => {
//   return jwt.verify(token, secret) as JwtPayload;
// };

// export const jwtHelpers = {
//   generateToken,
//   verifyToken,
// };
