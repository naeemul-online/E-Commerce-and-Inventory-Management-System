import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import { loginUser } from "../auth/auth.service";

const createUser = async (req: Request) => {
  const { fullName, phone, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  let hashPassword: string | undefined;

  if (password) {
    hashPassword = await bcrypt.hash(password, Number(config.salt_round));
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      phone,
      ...(hashPassword && { password: hashPassword }),
    },
  });

  // 🔥 If password exists → auto login
  if (password) {
    return await loginUser(phone, password);
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      role: user.role,
      isGuest: true,
    },
    config.jwt.jwt_secret as string,
    "1d",
  );

  // 🔥 Guest flow
  return {
    accessToken,
    isGuest: true,
    user: {
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    },
  };
};

const updateUser = async (req: Request): Promise<User> => {
  const userId = req.params.id as string;

  const { password, ...rest } = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found!");
  }

  let updateData = { password, ...rest };

  if (password) {
    const hashPassword = await bcrypt.hash(password, Number(config.salt_round));
    updateData.password = hashPassword;
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return result;
};

const allUsers = async (): Promise<User[]> => {
  const result = await prisma.user.findMany();
  return result;
};

const deleteUser = async (req: Request): Promise<User> => {
  const userId = req.params.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const result = await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result;
};

export const userService = { createUser, updateUser, allUsers, deleteUser };
