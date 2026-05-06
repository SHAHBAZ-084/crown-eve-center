// backend/src/modules/inventory/inventory.model.js
const prisma = require('../../config/db');

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

const updateStockById = (id, data) => prisma.inventory.update({
  where: { id },
  data,
  select: { id: true, stock: true, alertAt: true }
});

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
  const whereBranch = { branchId: Number(branchId) };

  const [lowStockCount, weeklyOut, weeklyIn] = await Promise.all([
    // 1. Low Stock Count
    prisma.inventory.count({
      where: { ...whereBranch, stock: { lte: prisma.inventory.fields.alertAt } }
    }),
    // 2. Weekly Out (Sales/Orders)
    prisma.orderItem.aggregate({
      where: {
        order: {
          branchId: Number(branchId),
          createdAt: { gte: lastWeek }
        }
      },
      _sum: { quantity: true }
    }),
    // 3. Weekly In (Purchases/Restock)
    prisma.purchaseItem.aggregate({
      where: {
        purchase: {
          branchId: Number(branchId),
          createdAt: { gte: lastWeek }
        }
      },
      _sum: { quantity: true }
    })
  ]);

  return {
    lowStock: lowStockCount,
    weeklyOut: weeklyOut._sum.quantity || 0,
    weeklyIn: weeklyIn._sum.quantity || 0
  };
};

module.exports = { getBranchInventory, updateStockById, getAlerts, getInventorySummary };
