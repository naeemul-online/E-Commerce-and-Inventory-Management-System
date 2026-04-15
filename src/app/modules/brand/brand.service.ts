import { Request } from "express";
import prisma from "../../../shared/prisma";
import { generateSlug } from "../../../utils/slug";

// CREATE
const createBrand = async (req: Request) => {
  const payload: { name: string } = req.body;

  const slug = await generateSlug(payload.name, "brand");

  return prisma.brand.create({
    data: {
      name: payload.name,
      slug,
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
  let slug: string | undefined;
  if (name) {
    slug = await generateSlug(name, "brand");
  }

  const result = await prisma.brand.update({
    where: { id },
    data: {
      name,
      slug,
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
