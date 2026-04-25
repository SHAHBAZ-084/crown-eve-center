// backend/src/modules/orders/order.model.js
const prisma = require('../../config/db');

const createOrder = async (data) => {
  const { branchId, customerId, total, type, notes, items } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Create the order
    const order = await tx.order.create({
      data: {
        branchId,
        customerId,
        total,
        type: type || 'POS',
        status: 'PENDING',
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: { include: { product: { include: { parts: true } } } } }
    });

    // 2. Deduct inventory for each item's parts
    for (const item of order.items) {
      for (const productPart of item.product.parts) {
        const qtyToDeduct = productPart.quantity * item.quantity;
        
        await tx.inventory.update({
          where: {
            branchId_partId: {
              branchId,
              partId: productPart.partId
            }
          },
          data: {
            stock: { decrement: qtyToDeduct }
          }
        });
      }
    }

    return order;
  });
};

const getOrders = async ({ page = 1, limit = 20, branchId, status, type, customerId }) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(status && { status }),
    ...(type && { type }),
    ...(customerId && { customerId: Number(customerId) }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        type: true,
        customer: {
          select: { id: true, name: true }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { name: true } }
          }
        }
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const countOrders = (where) => prisma.order.count({ where });

const getOrderById = (id) => prisma.order.findUnique({ 
  where: { id }, 
  select: {
    id: true,
    status: true,
    total: true,
    createdAt: true,
    branch: { select: { name: true } },
    customer: { select: { id: true, name: true, email: true } },
    items: {
      select: {
        quantity: true,
        price: true,
        product: { select: { name: true, price: true } }
      }
    }
  }
});

const updateOrderStatus = (id, status) => prisma.order.update({ 
  where: { id }, 
  data: { status },
  select: { id: true, status: true }
});

module.exports = { createOrder, getOrders, countOrders, getOrderById, updateOrderStatus };
