// backend/src/modules/products/product.model.js
const prisma = require('../../config/db');

const getProducts = async ({ page = 1, limit = 20, branchId, categoryId, product_type, search }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(categoryId && { categoryId }),
    ...(product_type && { product_type }),
    ...(search && { name: { contains: search, mode: 'insensitive' } })
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        branch: { select: { name: true } },
        category: true,
        brand: true,
        images: { orderBy: { sort_order: 'asc' } },
        bikeDetail: true,
        partDetail: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    }
  };
};

const getProductById = (id) => prisma.product.findUnique({
  where: { id },
  include: {
    branch: { select: { name: true } },
    category: true,
    brand: true,
    images: { orderBy: { sort_order: 'asc' } },
    bikeDetail: true,
    partDetail: true
  }
});

const createProduct = (data) => prisma.product.create({
  data,
  include: { bikeDetail: true, partDetail: true, images: true }
});

const updateProduct = (id, data) => prisma.product.update({
  where: { id },
  data,
  include: { bikeDetail: true, partDetail: true, images: true }
});

const deleteProduct = (id) => prisma.product.delete({
  where: { id }
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
