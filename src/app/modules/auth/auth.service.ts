import bcrypt from "bcryptjs";
import { Request } from "express";
import { Secret } from "jsonwebtoken";

import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";

/* 
1. guest user(fullName + phoneNumber)  -> allow login as guest ->  

*/

const normalizePhone = (input: string): string => {
  let cleaned = input.replace(/\s+/g, "");

  // 🇧🇩 Local format → +880
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `+880${cleaned.slice(1)}`;
  }

  // 880 format → +880
  if (cleaned.startsWith("880")) {
    return `+${cleaned}`;
  }

  // Already international
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Fallback (international guess)
  return `+${cleaned}`;
};

export const loginUser = async (phone: string, password?: string) => {
  const normalizedPhoneNumber = normalizePhone(phone);

  const user = await prisma.user.findUniqueOrThrow({
    where: { phone: normalizedPhoneNumber },
  });

  // 🔥 CASE 1: Guest user (NO PASSWORD)
  if (!user.password) {
    // ✅ allow login WITHOUT password

    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        role: user.role,
        isGuest: true, // 🔥 important flag
      },
      config.jwt.jwt_secret as Secret,
      "1d", // shorter expiry for guest
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
      message: "Logged in as guest. Please set password later.",
    };
  }

  // 🔵 CASE 2: Password user
  if (!password) {
    throw new Error("Please provide your password");
  }

  if (!password && user.password) {
    throw new Error("Please provide your password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      role: user.role,
      isGuest: false,
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

const login = async (req: Request) => {
  const { phone, password } = req.body;

  return await loginUser(phone, password);
};

const setPassword = async (req: Request) => {
  const { userId, password } = req.body;

  // 1️⃣ Find user
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
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
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  // 5️⃣ Generate JWT (🔥 auto login)
  const accessToken = jwtHelpers.generateToken(
    {
      email: user.id,
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
  login,
  setPassword,
};
