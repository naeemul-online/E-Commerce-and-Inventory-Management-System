import bcrypt from "bcryptjs";
import { Request } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";

import config from "../../../config";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import ApiError from "../../errors/ApiError";

/* register user 
1. User enters phone number, full name, and password → API checks if user exists
2. If user exists → throw error "User already exists, please login instead"
3. If user does NOT exist → create new user with phone + full name + hashed password
4. Generate JWT with isGuest: false and return to client

*/

export const registerUser = async (req: Request) => {
  const { fullName, phone, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (user) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this phone number, please login instead",
    );
  }

  const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

  const newUser = await prisma.user.create({
    data: {
      phone: phone,
      fullName,
      password: hashedPassword,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: newUser.id,
      role: newUser.role,
      isGuest: false,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
    isGuest: false,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
    },
  };
};

/* Guest User Login
1. User enters phone number and full name (optional) → API checks if user exists
2. If user does NOT exist → create new user with phone + full name, but NO password (guest user)
3. Generate JWT with isGuest: true and return to client
4. Client can use this token to access limited features (e.g., browse products, add to cart)
5. When user wants to or login their account → prompt them to set a password
6. User sets password → update user record with hashed password, set isGuest: false, and generate new JWT without isGuest flag

*/

export const guestLogin = async (phone: string, fullName?: string) => {
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

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      role: user.role,
      isGuest: true,
    },
    config.jwt.jwt_secret as Secret,
    "1d",
  );

  return {
    accessToken,
    isGuest: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
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

  const user = await prisma.user.findUnique({
    where: { phone: phone },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found, please register first",
    );
  }

  if (!user.password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This account is registered as a guest. Please set a password to login.",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  return {
    accessToken,
    isGuest: false,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    },
  };
};

/* Set Password
1.
*/

const setPassword = async (req: Request) => {
  const { phone, password } = req.body;

  // 1️⃣ Find user
  const user = await prisma.user.findUniqueOrThrow({
    where: { phone: phone },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2️⃣ Prevent overwrite (important)
  if (user.password) {
    throw new Error("Password already set. Please login.");
  }

  // 3️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

  // 4️⃣ Update user
  const updatedUser = await prisma.user.update({
    where: { phone: phone },
    data: {
      password: hashedPassword,
    },
  });

  // 5️⃣ Generate JWT (🔥 auto login)
  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string,
  );

  // 6️⃣ Return login response
  return {
    accessToken,
    user: {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      role: updatedUser.role,
    },
  };
};

export const authService = {
  guestLogin,
  registerUser,
  login,
  setPassword,
};
