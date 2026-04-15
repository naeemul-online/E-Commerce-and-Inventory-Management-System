import { Request } from "express";
import prisma from "../../../shared/prisma";

export const allUsers = async (req: Request) => {
  const users = await prisma.user.findMany();
  return users;
};

export const adminService = {
  allUsers,
};
