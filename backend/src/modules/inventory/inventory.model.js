// backend/src/modules/inventory/inventory.model.js
const prisma = require('../../config/db');
const { syncInventoryToPartsAndProducts } = require('./inventory.utils');

const getBranchInventory = async ({ branchId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const where = { branchId: Number(branchId) };

  const [data, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        stock: true,
        alertAt: true,
        part: {
          select: { id: true, name: true, category: true, price: true }
        }
      }
    }),
    prisma.inventory.count({ where })
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

const updateStockById = async (id, data) => {
  return prisma.$transaction(async (tx) => {
    // 1. Get current stock for adjustment calculation
    const currentInv = await tx.inventory.findUnique({
      where: { id },
      select: { stock: true, branchId: true, partId: true }
    });

    if (!currentInv) throw new Error("Inventory item not found");

    const nStock = Number(data.stock);
    const nAlert = Number(data.alertAt);
    const delta = nStock - currentInv.stock;

    // 2. Update the inventory stock
    const inventory = await tx.inventory.update({
      where: { id },
      data: {
        stock: nStock,
        alertAt: nAlert
      },
      select: { id: true, stock: true, alertAt: true, branchId: true, partId: true }
    });

    // 3. Log the adjustment if there was a change
    if (delta !== 0) {
      await tx.stockAdjustment.create({
        data: {
          branchId: inventory.branchId,
          partId: inventory.partId,
          quantity: delta,
          reason: "Manual Update"
        }
      });
    }

    // 4. Sync stocks to Parts and Products
    await syncInventoryToPartsAndProducts(tx, inventory.branchId, inventory.partId);

    return inventory;
  });
};

const getAlerts = (branchId, isGlobal = false) => {
  const where = isGlobal ? {} : { branchId: Number(branchId) };
  return prisma.inventory.findMany({
    where,
    select: {
      id: true,
      stock: true,
      alertAt: true,
      branch: { select: { name: true } },
      part: { select: { name: true } }
    }
  });
};

const getInventorySummary = async (branchId) => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const bId = Number(branchId);

  // 1. Low Stock Count using Raw SQL for absolute precision
  // This avoids any issues with Prisma col-to-col comparison
  const lowStockResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count 
    FROM "Inventory" 
    WHERE "branchId" = ${bId} AND "stock" <= "alertAt"
  `;
  const lowStockCount = lowStockResult[0]?.count || 0;

  const [weeklyOutOrders, weeklyInPurchases, weeklyAdjustments] = await Promise.all([
    // 2. Weekly Out (Sales/Orders)
    prisma.orderItem.aggregate({
      where: {
        order: {
          branchId: bId,
          createdAt: { gte: lastWeek }
        }
      },
      _sum: { quantity: true }
    }),
    // 3. Weekly In (Purchases/Restock)
    prisma.purchaseItem.aggregate({
      where: {
        purchase: {
          branchId: bId,
          createdAt: { gte: lastWeek }
        }
      },
      _sum: { quantity: true }
    }),
    // 4. Weekly Manual Adjustments
    prisma.stockAdjustment.aggregate({
      where: {
        branchId: bId,
        createdAt: { gte: lastWeek }
      },
      _sum: { quantity: true }
    })
  ]);

  const totalOut = (weeklyOutOrders._sum.quantity || 0) + (weeklyAdjustments._sum.quantity < 0 ? Math.abs(weeklyAdjustments._sum.quantity) : 0);
  const totalIn = (weeklyInPurchases._sum.quantity || 0) + (weeklyAdjustments._sum.quantity > 0 ? weeklyAdjustments._sum.quantity : 0);

  return {
    lowStock: lowStockCount,
    weeklyOut: totalOut,
    weeklyIn: totalIn
  };
};

module.exports = { getBranchInventory, updateStockById, getAlerts, getInventorySummary };
