// backend/src/modules/purchases/purchase.model.js
const prisma = require('../../config/db');
const { syncInventoryToPartsAndProducts } = require('../inventory/inventory.utils');

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
  const { supplierId, branchId, total, items, remarks, documentNo, purchaseNo, partyInvoiceNo } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Create the purchase record
    const purchase = await tx.purchase.create({
      data: {
        supplierId,
        branchId,
        total,
        remarks,
        documentNo,
        purchaseNo,
        partyInvoiceNo,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
            engineNo: item.engineNo,
            chassisNo: item.chassisNo,
            stockType: item.stockType
          }))
        }
      }
    });

    // 2. Update inventory for each product/part
    for (const item of items) {
      // Find parts associated with this product
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { productParts: true }
      });

      if (product && product.productParts.length > 0) {
        for (const pp of product.productParts) {
          await tx.inventory.upsert({
            where: {
              branchId_partId: {
                branchId,
                partId: pp.partId
              }
            },
            update: {
              stock: { increment: item.quantity * pp.quantity }
            },
            create: {
              branchId,
              partId: pp.partId,
              stock: item.quantity * pp.quantity,
              alertAt: 10
            }
          });
          // Sync stocks
          await syncInventoryToPartsAndProducts(tx, branchId, pp.partId);
        }
      } else {
        // If product has no parts, just increment its stock_qty directly
        await tx.product.update({
          where: { id: item.productId },
          data: { stock_qty: { increment: item.quantity } }
        });
      }
    }

    return purchase;
  }, {
    timeout: 10000 // Increase timeout for complex transactions
  });
};

module.exports = { getPurchases, createPurchase };
