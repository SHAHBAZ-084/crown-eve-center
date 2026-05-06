// backend/src/modules/products/product.model.js
const prisma = require('../../config/db');

const getProducts = async ({ page = 1, limit = 20, branchId, categoryId, product_type, search, sortBy, order }) => {
  const skip = (page - 1) * limit;
  
  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(categoryId && { categoryId }),
    ...(product_type && { product_type }),
    ...(search && { 
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { partDetail: { item_code: { contains: search, mode: 'insensitive' } } },
        { partDetail: { model: { contains: search, mode: 'insensitive' } } },
        { partDetail: { description: { contains: search, mode: 'insensitive' } } }
      ] 
    })
  };

  // Dynamic sorting
  let orderBy = { createdAt: 'desc' }; // Default
  if (sortBy === 'price') {
    orderBy = { price: order === 'desc' ? 'desc' : 'asc' };
  } else if (sortBy === 'stock') {
    orderBy = { stock_qty: order === 'asc' ? 'asc' : 'desc' };
  } else if (sortBy === 'name') {
    orderBy = { name: order === 'desc' ? 'desc' : 'asc' };
  }

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
        partDetail: true,
        productParts: {
          include: {
            part: {
              include: {
                inventory: {
                  where: { branchId: branchId ? Number(branchId) : 0 }
                }
              }
            }
          }
        }
      },
      orderBy
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

const getProductById = async (id) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        branch: { select: { name: true, location: true } },
        category: true,
        brand: true,
        images: { orderBy: { sort_order: 'asc' } },
        bikeDetail: true,
        partDetail: true
      }
    });

    if (!product) return null;

    // Find the same product in other branches
    let otherBranches = [];
    try {
      otherBranches = await prisma.product.findMany({
        where: {
          id: { not: id },
          name: product.name,
          is_active: true,
          OR: [
            ...(product.partDetail?.item_code ? [{ partDetail: { is: { item_code: product.partDetail.item_code } } }] : []),
            ...(product.bikeDetail?.motor_type ? [{ bikeDetail: { is: { motor_type: product.bikeDetail.motor_type } } }] : [])
          ]
        },
        select: {
          id: true,
          stock_qty: true,
          price: true,
          sale_price: true,
          branch: { select: { id: true, name: true, location: true } }
        },
        take: 5
      });
    } catch (err) {
      console.error("Error fetching other branches:", err);
    }

    return { ...product, otherBranches };
  } catch (err) {
    console.error("Error in getProductById:", err);
    throw err;
  }
};

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
