import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { generateSlug } from "../../../utils/slug";
import { fileUploader } from "../../../helpers/fileUploader";
import ApiError from "../../errors/ApiError";

// CREATE
const createBrand = async (req: Request) => {
  const payload: { name: string } = req.body;
  const imageFile = req.file;

  const isBrandExist = await prisma.brand.findFirst({
    where: {
      name: payload.name,
    },
  });

  if (isBrandExist) {
    throw new ApiError(httpStatus.CONFLICT, "This brand already exist!");
  }

  const slug = await generateSlug(payload.name, "brand");
  const uploadedImage = imageFile
    ? await fileUploader.uploadToCloudinary(imageFile, { folder: "ecommerce/brands" })
    : null;

  return prisma.brand.create({
    data: {
      name: payload.name,
      slug,
      image: uploadedImage?.secure_url,
    },
  });
};

// GET ALL
const getAllBrands = async () => {
  return prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// GET SINGLE
const getSingleBrand = async (req: Request) => {
  const id = req.params.id as string;

  return prisma.brand.findUnique({
    where: { id },
  });
};

// UPDATE
const updateBrand = async (req: Request) => {
  const id = req.params.id as string;
  const { name } = req.body;
  const imageFile = req.file;
  const existingBrand = await prisma.brand.findUnique({
    where: { id },
    select: { image: true },
  });

  let slug: string | undefined;
  if (name) {
    slug = await generateSlug(name, "brand");
  }
  const uploadedImage = imageFile
    ? await fileUploader.uploadToCloudinary(imageFile, { folder: "ecommerce/brands" })
    : undefined;

  if (uploadedImage && existingBrand?.image) {
    await fileUploader.deleteFromCloudinary(existingBrand.image);
  }

  const result = await prisma.brand.update({
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
const deleteBrand = async (req: Request) => {
  const id = req.params.id as string;
  return prisma.brand.delete({
    where: { id },
  });
};

export const brandService = {
  createBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
  deleteBrand,
};
