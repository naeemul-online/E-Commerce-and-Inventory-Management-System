import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { fileUploader } from "../../../helpers/fileUploader";
import { buildProductQuery } from "../../../shared/query-builder";
import prisma from "../../../shared/prisma";
import { searchService } from "../../../shared/searchService";
import { generateSlug } from "../../../utils/slug";

const uploadImagesToCloudinary = async (files?: Express.Multer.File[]) => {
  if (!files?.length) return [];
  const uploadResults = await Promise.all(
    files.map((file) => fileUploader.uploadToCloudinary(file)),
  );
  return uploadResults.map((result) => result.secure_url);
};

const calculateSearchScore = (title: string, description: string, term: string) => {
  const normalizedTitle = title.toLowerCase();
  const normalizedDescription = description.toLowerCase();
  const normalizedTerm = term.toLowerCase();

  if (normalizedTitle === normalizedTerm) return 100;
  if (normalizedTitle.startsWith(normalizedTerm)) return 80;
  if (normalizedTitle.includes(normalizedTerm)) return 60;
  if (normalizedDescription.includes(normalizedTerm)) return 30;
  return 0;
};

const ensureDiscountedPrice = (
  regularPrice?: number,
  discountedPrice?: number | null,
) => {
  if (
    discountedPrice !== undefined &&
    discountedPrice !== null &&
    regularPrice !== undefined &&
    discountedPrice >= regularPrice
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Discounted price must be less than regular price",
    );
  }
};

const ensureCategoryAndBrand = async (categoryId: string, brandId: string) => {
  const [category, brand] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
    prisma.brand.findUnique({ where: { id: brandId }, select: { id: true } }),
  ]);

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid categoryId: category not found");
  }

  if (!brand) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid brandId: brand not found");
  }
};

const createProduct = async (req: Request) => {
  const payload = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files?.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "At least one product image is required");
  }

  await ensureCategoryAndBrand(payload.categoryId, payload.brandId);
  ensureDiscountedPrice(payload.regularPrice, payload.discountedPrice);

  const slug = await generateSlug(payload.title, "product");
  const images = await uploadImagesToCloudinary(files);

  return prisma.product.create({
    data: {
      ...payload,
      slug,
      images,
    },
  });
};

const getAllProducts = async (req: Request) => {
  const { where, orderBy, skip, take, page, limit } = buildProductQuery(req.query);

  const [products, totalData] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true,
        brand: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    meta: {
      totalData,
      totalPages: Math.max(Math.ceil(totalData / limit), 1),
      currentPage: page,
      limit,
    },
    data: products,
  };
};

const searchProducts = async (req: Request) => {
  const searchTerm = String(req.query.searchTerm ?? "").trim();

  const products = (await searchService.search({
    model: "product",
    fields: ["title", "description"],
    searchTerm,
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
      regularPrice: true,
      description: true,
    },
    take: 12,
  })) as Array<{
    id: string;
    title: string;
    slug: string;
    images: string[];
    regularPrice: number;
    description: string;
  }>;

  const ranked = products
    .map((product) => ({
      ...product,
      score: calculateSearchScore(product.title, product.description, searchTerm),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.map((product) => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    images: product.images,
    price: product.regularPrice,
  }));
};

const getSingleProduct = async (req: Request) => {
  const slug = req.params.slug as string;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product;
};

const updateProduct = async (req: Request) => {
  const id = req.params.id as string;
  const payload = req.body;
  const files = req.files as Express.Multer.File[] | undefined;
  const hasNewImages = Boolean(files?.length);
  let existingImages: string[] = [];

  if (hasNewImages) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!existingProduct) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    existingImages = existingProduct.images;
  }

  if (payload.categoryId || payload.brandId) {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true },
    });

    if (!existing) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    await ensureCategoryAndBrand(
      payload.categoryId ?? existing.categoryId,
      payload.brandId ?? existing.brandId,
    );
  }

  if (payload.regularPrice !== undefined || payload.discountedPrice !== undefined) {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { regularPrice: true, discountedPrice: true },
    });

    if (!existing) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    ensureDiscountedPrice(
      payload.regularPrice ?? existing.regularPrice,
      payload.discountedPrice ?? existing.discountedPrice,
    );
  }

  let slug: string | undefined;
  if (payload.title) {
    slug = await generateSlug(payload.title, "product");
  }

  const images = await uploadImagesToCloudinary(files);
  if (images.length && existingImages.length) {
    await Promise.all(
      existingImages.map((imageUrl) => fileUploader.deleteFromCloudinary(imageUrl)),
    );
  }

  return prisma.product.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      description: payload.description,
      regularPrice: payload.regularPrice,
      discountedPrice: payload.discountedPrice,
      stock: payload.stock,
      isNew: payload.isNew,
      isOffered: payload.isOffered,
      categoryId: payload.categoryId,
      brandId: payload.brandId,
      tags: payload.tags,
      ...(images.length ? { images } : {}),
    },
  });
};

const deleteProduct = async (req: Request) => {
  const id = req.params.id as string;
  await prisma.product.delete({
    where: { id },
  });
  return null;
};

export const productService = {
  createProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
