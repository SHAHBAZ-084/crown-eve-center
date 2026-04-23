// backend/src/modules/products/product.model.js
const prisma = require('../../config/db');

const getProducts = async ({ page = 1, limit = 20, branchId, category, search }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(category && { category }),
    ...(search && { name: { contains: search } })
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        branch: { select: { name: true } },
        parts: { include: { part: true } }
      }
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
    parts: { include: { part: true } }
  }
});

const createProduct = (data) => prisma.product.create({
  data,
  include: { parts: true }
});

const updateProduct = (id, data) => prisma.product.update({
  where: { id },
  data,
  include: { parts: true }
});

const deleteProduct = (id) => prisma.product.delete({
  where: { id }
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
