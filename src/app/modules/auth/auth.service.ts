import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request } from "express";
import httpStatus from "http-status";

import config from "../../../config";
import prisma from "../../../shared/prisma";
import { jwtHelpers, JWTPayload } from "../../../utils/jwtHelpers";
import ApiError from "../../errors/ApiError";

/* register user 
1. User enters phone number, full name, and password → API checks if user exists
2. If user exists → throw error "User already exists, please login instead"
3. If user does NOT exist → create new user with phone + full name + hashed password
4. Generate JWT with isGuest: false and return to client

*/

export const registerUser = async (req: Request) => {
  const { fullName, phone, password } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { phone: phone },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email or phone",
    );
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      phone,
      fullName,
      password: hashedPassword,
      role: Role.USER,
    },
  });

  // 4. Generate tokens
  const payload: JWTPayload = {
    id: user.id,
    role: user.role,
    phone: user.phone,
  };

  const { accessToken, refreshToken } = jwtHelpers.generateTokens(payload);

  // 5. Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    isGuest: false,
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

/* User Login 
1. User enters phone number and password → API checks if user exists  and password matches
2. If user does NOT exist → throw error "User not found, please register first"
3. If password does NOT match → throw error "Incorrect password"
4. If login successful → generate JWT with isGuest: false and return to client  
*/

const login = async (req: Request) => {
  const { phone, password } = req.body;

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This account has no password. Please reset your password.",
    );
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }

  // 3. Generate tokens
  const payload: JWTPayload = {
    id: user.id,
    role: user.role,
    phone: user.phone,
  };

  const { accessToken, refreshToken } = jwtHelpers.generateTokens(payload);

  // 4. Save refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    isGuest: false,
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

/**
 * Logout user (invalidate refresh token)
 */
export const logoutUser = async (refreshToken?: string) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  return { message: "Logged out successfully" };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  console.log(refreshToken);
  if (!refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token not provided");
  }

  // 1. Verify refresh token
  const decoded = jwtHelpers.verifyRefreshToken(refreshToken);

  // 2. Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Refresh token expired or invalid",
    );
  }

  // 3. Generate new access token
  const payload: JWTPayload = {
    id: decoded.id,
    role: decoded.role,
    phone: decoded.phone,
  };

  const newAccessToken = jwtHelpers.generateAccessToken(payload);

  return { accessToken: newAccessToken };
};

export const guestLogin = async (req: Request) => {
  const { phone, fullName } = req.body;

  let user = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (!user) {
    // Create new guest user
    user = await prisma.user.create({
      data: {
        phone: phone,
        fullName: fullName || "",
      },
    });
  }

  // Generate tokens
  const payload: JWTPayload = {
    id: user.id,
    role: user.role,
    phone: user.phone,
  };

  const { accessToken, refreshToken } = jwtHelpers.generateTokens(payload);

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    isGuest: true,
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

/* Set Password
1. User try login putting password got error password not set redirect to modal
2. Putting password call to update in the backend
3. Login
*/

const setPassword = async (req: Request) => {
  const { phone, password } = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { phone: phone },
  });

  const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

  await prisma.user.update({
    where: { phone: phone },
    data: {
      password: hashedPassword,
    },
  });

  //Generate tokens
  const payload: JWTPayload = {
    id: user.id,
    role: user.role,
    phone: user.phone,
  };

  const { accessToken, refreshToken } = jwtHelpers.generateTokens(payload);

  return {
    accessToken,
    refreshToken,
    isGuest: false,
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

export const authService = {
  guestLogin,
  registerUser,
  login,
  getUserProfile,
  logoutUser,
  refreshAccessToken,
  setPassword,
};
