// backend/src/modules/orders/order.model.js
const prisma = require('../../config/db');

const createOrder = async (data) => {
  const { branchId, customerId, total, type, payment_method, transaction_id, customer_name, customer_phone, notes, items } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Create the order
    const order = await tx.order.create({
      data: {
        branchId: Number(branchId),
        customerId: customerId || undefined,
        total: Number(total),
        type: type || 'POS',
        status: type === 'POS' ? 'COMPLETED' : 'PENDING',
        payment_method: payment_method || 'CASH',
        transaction_id,
        customer_name,
        customer_phone,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Number(item.price)
          }))
        }
      },
      include: { items: { include: { product: { include: { productParts: true } } } } }
    });

    // 2. Deduct inventory for each item's parts
    for (const item of order.items) {
      for (const productPart of item.product.productParts) {
        const qtyToDeduct = productPart.quantity * item.quantity;
        
        // Find current stock
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_partId: {
              branchId: Number(branchId),
              partId: Number(productPart.partId)
            }
          },
          include: { part: true }
        });

        if (!inv || inv.stock < qtyToDeduct) {
          throw new Error(`Insufficient stock for: ${inv?.part?.name || 'Item'}. Available: ${inv?.stock || 0}`);
        }
        
        await tx.inventory.update({
          where: { id: inv.id },
          data: { stock: { decrement: qtyToDeduct } }
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
    ...(customerId && { customerId: String(customerId) }),
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
        payment_method: true,
        transaction_id: true,
        customer_name: true,
        customer_phone: true,
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
