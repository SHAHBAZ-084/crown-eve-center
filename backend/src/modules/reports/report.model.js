// backend/src/modules/reports/report.model.js
const prisma = require('../../config/db');

const getRevenueSummary = async ({ branchId }) => {
  const where = {
    status: 'COMPLETED',
    ...(branchId && { branchId: Number(branchId) }),
  };

  const now = new Date();
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, week, month] = await Promise.all([
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfToday } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfWeek } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfMonth } }, _sum: { total: true } })
  ]);

  return {
    today: today._sum.total || 0,
    thisWeek: week._sum.total || 0,
    thisMonth: month._sum.total || 0
  };
};

const getRevenueChart = async ({ branchId, days = 30 }) => {
  const results = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const agg = await prisma.order.aggregate({
      where: {
        branchId: branchId ? Number(branchId) : undefined,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end }
      },
      _sum: { total: true }
    });
    
    results.push({
      date: start.toISOString().split('T')[0],
      revenue: agg._sum.total || 0
    });
  }
  return results;
};

const getBranchStats = (id) => prisma.branch.findUnique({
  where: { id },
  include: {
    _count: {
      select: { orders: true, appointments: true, products: true }
    }
  }
});

const getBranchRevenue = (id) => prisma.order.aggregate({
  where: { branchId: id, status: 'COMPLETED' },
  _sum: { total: true }
});

const getSalesReport = (branchId) => prisma.order.findMany({
  where: { branchId, status: 'COMPLETED' },
  include: { items: { include: { product: true } } },
  orderBy: { createdAt: 'desc' }
});

module.exports = { getRevenueSummary, getRevenueChart, getBranchStats, getBranchRevenue, getSalesReport };
