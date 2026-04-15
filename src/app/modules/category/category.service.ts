import { Request } from "express";
import prisma from "../../../shared/prisma";
import { generateSlug } from "../../../utils/slug";

const createCategory = async (req: Request) => {
  const payload: { name: string } = req.body;

  const slug = await generateSlug(payload.name, "category");

  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
    },
  });
};
// GET ALL
const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

// GET SINGLE
const getSingleCategory = async (req: Request) => {
  const id = req.params.id as string;

  const result = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });

  return result;
};

// UPDATE
const updateCategory = async (req: Request) => {
  const id = req.params.id as string;
  const { name } = req.body;
  let slug: string | undefined;
  if (name) {
    slug = await generateSlug(name, "category");
  }

  const result = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
    },
  });

  return result;
};

// DELETE
const deleteCategory = async (req: Request) => {
  const id = req.params.id as string;

  const result = await prisma.category.delete({
    where: {
      id: id,
    },
  });

  return result;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
