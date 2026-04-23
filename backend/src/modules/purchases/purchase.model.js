// backend/src/modules/purchases/purchase.model.js
const prisma = require('../../config/db');

const getPurchases = async ({ page = 1, limit = 20, branchId, supplierId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(supplierId && { supplierId: Number(supplierId) })
  };

  const [data, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        supplier: true,
        items: { include: { part: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.purchase.count({ where })
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const createPurchase = async (data) => {
  const { supplierId, branchId, total, items } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Create the purchase record
    const purchase = await tx.purchase.create({
      data: {
        supplierId,
        branchId,
        total,
        items: {
          create: items.map(item => ({
            partId: item.partId,
            quantity: item.quantity,
            cost: item.cost
          }))
        }
      }
    });

    // 2. Update/Upsert inventory for each part
    for (const item of items) {
      await tx.inventory.upsert({
        where: {
          branchId_partId: {
            branchId,
            partId: item.partId
          }
        },
        update: {
          stock: { increment: item.quantity }
        },
        create: {
          branchId,
          partId: item.partId,
          stock: item.quantity,
          alertAt: 10
        }
      });
    }

    return purchase;
  });
};

module.exports = { getPurchases, createPurchase };
