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

  const [today, week, month, total] = await Promise.all([
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfToday } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfWeek } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...where, createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...where }, _sum: { total: true } })
  ]);

  return {
    today: today._sum.total || 0,
    thisWeek: week._sum.total || 0,
    thisMonth: month._sum.total || 0,
    totalRevenue: total._sum.total || 0
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
      select: { orders: true, serviceBookings: true, products: true },
    },
  },
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

const getBranchPerformanceChart = async ({ days = 7 } = {}) => {
  const dayCount = Number(days) || 7;
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const dateKeys = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dateKeys.push(d.toISOString().split('T')[0]);
  }

  const rangeStart = new Date(dateKeys[0]);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(dateKeys[dateKeys.length - 1]);
  rangeEnd.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: rangeStart, lte: rangeEnd },
    },
    select: { branchId: true, total: true, createdAt: true },
  });

  const bucket = {};
  for (const dk of dateKeys) {
    bucket[dk] = { date: dk };
    for (const b of branches) {
      bucket[dk][`rev_${b.id}`] = 0;
      bucket[dk][`ord_${b.id}`] = 0;
    }
  }

  for (const order of orders) {
    const dk = new Date(order.createdAt).toISOString().split('T')[0];
    if (!bucket[dk]) continue;
    const revKey = `rev_${order.branchId}`;
    const ordKey = `ord_${order.branchId}`;
    if (revKey in bucket[dk]) {
      bucket[dk][revKey] += order.total || 0;
      bucket[dk][ordKey] += 1;
    }
  }

  return {
    branches,
    series: dateKeys.map((dk) => bucket[dk]),
  };
};

module.exports = {
  getRevenueSummary,
  getRevenueChart,
  getBranchStats,
  getBranchRevenue,
  getSalesReport,
  getBranchPerformanceChart,
};
