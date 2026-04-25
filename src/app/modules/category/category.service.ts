import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { generateSlug } from "../../../utils/slug";
import { fileUploader } from "../../../helpers/fileUploader";
import ApiError from "../../errors/ApiError";

const createCategory = async (req: Request) => {
  const payload: { name: string } = req.body;
  const imageFile = req.file;

  const isCategoryExist = await prisma.category.findFirst({
    where: {
      name: payload.name,
    },
  });

  if (isCategoryExist) {
    throw new ApiError(httpStatus.CONFLICT, "This category already exist!");
  }

  const slug = await generateSlug(payload.name, "category");
  const uploadedImage = imageFile
    ? await fileUploader.uploadToCloudinary(imageFile, { folder: "ecommerce/categories" })
    : null;

  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
      image: uploadedImage?.secure_url,
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
  const imageFile = req.file;
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    select: { image: true },
  });

  let slug: string | undefined;
  if (name) {
    slug = await generateSlug(name, "category");
  }

  const uploadedImage = imageFile
    ? await fileUploader.uploadToCloudinary(imageFile, { folder: "ecommerce/categories" })
    : undefined;

  if (uploadedImage && existingCategory?.image) {
    await fileUploader.deleteFromCloudinary(existingCategory.image);
  }

  const result = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      ...(uploadedImage ? { image: uploadedImage.secure_url } : {}),
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
