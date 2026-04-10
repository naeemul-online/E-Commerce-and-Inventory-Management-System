import { Request } from "express";
import prisma from "../../../shared/prisma";

/* register user 
1. User enters phone number, full name, and password → API checks if user exists
2. If user exists → throw error "User already exists, please login instead"
3. If user does NOT exist → create new user with phone + full name + hashed password
4. Generate JWT with isGuest: false and return to client

*/

export const allUsers = async (req: Request) => {
  const users = await prisma.user.findMany();
  return users;
};

export const adminServices = {
  allUsers,
};
