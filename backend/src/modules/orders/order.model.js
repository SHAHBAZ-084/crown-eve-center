// backend/src/modules/orders/order.model.js
const prisma = require('../../config/db');
const { syncInventoryToPartsAndProducts } = require('../inventory/inventory.utils');

const createOrder = async (data) => {
  const { branchId, customerId, walkInCustomerId, bankId, total, type, payment_method, transaction_id, customer_name, customer_phone, notes, items } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Create the order
    const order = await tx.order.create({
      data: {
        branchId: Number(branchId),
        customerId: customerId || undefined,
        walkInCustomerId: walkInCustomerId || undefined,
        bankId: bankId || undefined,
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
            productId: item.productId || item.id,
            quantity: Number(item.quantity || item.qty),
            price: Number(item.price)
          }))
        }
      },
      include: { items: { include: { product: { include: { productParts: true } } } } }
    });

    // 2. Update stock for each item
    for (const item of order.items) {
      if (!item.product) continue;
      
      const quantitySold = Number(item.quantity);

      // A. Always decrement the Product's own stock_qty first
      await tx.product.update({
        where: { id: item.productId },
        data: { stock_qty: { decrement: quantitySold } }
      });

      // B. If it has parts, deduct from their inventory too
      if (item.product.productParts && item.product.productParts.length > 0) {
        for (const productPart of item.product.productParts) {
          const qtyToDeduct = productPart.quantity * quantitySold;
          
          // Find or create inventory record to ensure deduction happens
          const inv = await tx.inventory.findUnique({
            where: {
              branchId_partId: {
                branchId: Number(branchId),
                partId: Number(productPart.partId)
              }
            }
          });

          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: { stock: { decrement: qtyToDeduct } }
            });
          } else {
            // If no inventory record exists, create one with negative stock (or 0 - deduction)
            // This ensures we track that we are out of sync/negative
            await tx.inventory.create({
              data: {
                branchId: Number(branchId),
                partId: Number(productPart.partId),
                stock: -qtyToDeduct
              }
            });
          }
          
          // Sync stocks back to Product (re-calculates based on all parts)
          await syncInventoryToPartsAndProducts(tx, branchId, productPart.partId);
        }
      }
    }

    // 3. Handle Customer Debit (Credit Sale)
    if (order.walkInCustomerId) {
      await tx.walkInCustomer.update({
        where: { id: order.walkInCustomerId },
        data: { balance: { increment: Number(total) } }
      });

      await tx.walkInCustomerLedger.create({
        data: {
          customerId: order.walkInCustomerId,
          amount: Number(total),
          type: 'DEBIT',
          description: `Sale Invoice #${order.id} - ${type === 'POS' ? 'POS Terminal' : 'Online Order'}`,
          orderId: order.id
        }
      });
    } else if (bankId) {
      // 4. Update Bank Balance only for non-walkin (or if explicitly provided without walkin)
      await tx.bank.update({
        where: { id: bankId },
        data: { current_balance: { increment: Number(total) } }
      });
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
        walkInCustomer: {
          select: { id: true, first_name: true, last_name: true }
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
