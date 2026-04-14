import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import prisma from "../../../shared/prisma";

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

export const userService = { updateUser };
