import { Prisma } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";

import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";

const MAX_CART_ITEM_QUANTITY = 50;

type TxClient = Prisma.TransactionClient;

const requireUserId = (req: Request) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  return userId;
};

const getOrCreateCart = async (tx: TxClient, userId: string) => {
  const existing = await tx.cart.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existing) return existing;

  return tx.cart.create({
    data: { userId },
    select: { id: true },
  });
};

const getCartResponse = async (tx: TxClient, userId: string) => {
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              regularPrice: true,
              discountedPrice: true,
              stock: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      items: [],
      summary: {
        totalItems: 0,
        subtotal: 0,
      },
    };
  }

  const items = cart.items.map((item) => {
    const unitPrice = item.product.discountedPrice ?? item.product.regularPrice;
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        image: item.product.images[0] ?? null,
        stock: item.product.stock,
      },
      pricing: {
        unitPrice,
        lineTotal,
      },
    };
  });

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.pricing.lineTotal, 0);

  return {
    id: cart.id,
    items,
    summary: {
      totalItems,
      subtotal,
    },
  };
};

const getProductForCart = async (tx: TxClient, productId: string) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      stock: true,
      isPublished: true,
    },
  });

  if (!product || !product.isPublished) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not found or unavailable");
  }

  if (product.stock < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product is out of stock");
  }

  return product;
};

const getMyCart = async (req: Request) => {
  const userId = requireUserId(req);

  return prisma.$transaction(async (tx) => getCartResponse(tx, userId));
};

const addItem = async (req: Request) => {
  const userId = requireUserId(req);
  const { productId, quantity } = req.body as { productId: string; quantity: number };

  return prisma.$transaction(async (tx) => {
    const product = await getProductForCart(tx, productId);
    const cart = await getOrCreateCart(tx, userId);
    const existingItem = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const targetQuantity = Math.min(
      product.stock,
      MAX_CART_ITEM_QUANTITY,
      (existingItem?.quantity ?? 0) + quantity,
    );

    if (existingItem) {
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: targetQuantity,
        },
      });
    }

    return getCartResponse(tx, userId);
  });
};

const updateItemQuantity = async (req: Request) => {
  const userId = requireUserId(req);
  const { itemId } = req.params as { itemId: string };
  const { quantity } = req.body as { quantity: number };

  return prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            id: true,
            userId: true,
          },
        },
        product: {
          select: {
            stock: true,
          },
        },
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    if (quantity > item.product.stock) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Only ${item.product.stock} item(s) available in stock`,
      );
    }

    await tx.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY),
      },
    });

    return getCartResponse(tx, userId);
  });
};

const removeItem = async (req: Request) => {
  const userId = requireUserId(req);
  const { itemId } = req.params as { itemId: string };

  return prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: { userId: true },
        },
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
    }

    await tx.cartItem.delete({
      where: { id: itemId },
    });

    return getCartResponse(tx, userId);
  });
};

const clearMyCart = async (req: Request) => {
  const userId = requireUserId(req);

  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (cart) {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return getCartResponse(tx, userId);
  });
};

const mergeGuestCart = async (req: Request) => {
  const userId = requireUserId(req);
  const { items } = req.body as { items: Array<{ productId: string; quantity: number }> };

  return prisma.$transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, userId);
    const aggregated = new Map<string, number>();

    items.forEach((item) => {
      const current = aggregated.get(item.productId) ?? 0;
      const bounded = Math.min(item.quantity, MAX_CART_ITEM_QUANTITY);
      aggregated.set(item.productId, Math.min(current + bounded, MAX_CART_ITEM_QUANTITY));
    });

    const requestedProductIds = [...aggregated.keys()];
    const products = await tx.product.findMany({
      where: { id: { in: requestedProductIds } },
      select: {
        id: true,
        stock: true,
        isPublished: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const existingItems = await tx.cartItem.findMany({
      where: {
        cartId: cart.id,
        productId: { in: requestedProductIds },
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
      },
    });
    const existingMap = new Map(existingItems.map((item) => [item.productId, item]));
    const skippedItems: Array<{ productId: string; reason: string }> = [];

    for (const [productId, incomingQuantity] of aggregated.entries()) {
      const product = productMap.get(productId);
      if (!product || !product.isPublished) {
        skippedItems.push({ productId, reason: "Product not found or unavailable" });
        continue;
      }

      if (product.stock < 1) {
        skippedItems.push({ productId, reason: "Out of stock" });
        continue;
      }

      const existing = existingMap.get(productId);
      const quantity = Math.min(
        MAX_CART_ITEM_QUANTITY,
        product.stock,
        (existing?.quantity ?? 0) + incomingQuantity,
      );

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }
    }

    const mergedCart = await getCartResponse(tx, userId);

    return {
      ...mergedCart,
      skippedItems,
    };
  });
};

export const cartService = {
  getMyCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearMyCart,
  mergeGuestCart,
};
