// backend/src/modules/reports/report.controller.js
const Report = require('./report.model');
const Order = require('../orders/order.model');
const Booking = require('../service-bookings/booking.model');
const Inventory = require('../inventory/inventory.model');
const prisma = require('../../config/db');
const resolveBranchId = (req) => {
  const role = req.user.role;
  if (role === 'BRANCH_OWNER' || role === 'BRANCH_MANAGER' || role === 'EMPLOYEE' || role === 'TECHNICIAN') {
    return req.user.branchId;
  }
  const requested = Number(req.query.branchId);
  return Number.isFinite(requested) ? requested : null;
};

exports.getRevenueSummary = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === 'BRANCH_OWNER') {
      if (query.branchId && Number(query.branchId) !== req.user.branchId) {
        return res.status(403).json({ message: 'Access denied to other branch reports' });
      }
      query.branchId = req.user.branchId;
    }
    const result = await Report.getRevenueSummary(query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === 'BRANCH_OWNER') {
      query.branchId = req.user.branchId;
    }
    const days = query.period === '30d' ? 30 : 7;
    const result = await Report.getRevenueChart({ branchId: query.branchId, days });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.compareBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: { status: 'COMPLETED' },
          select: { total: true }
        }
      }
    });

    const data = branches.map(b => ({
      name: b.name,
      revenue: b.orders.reduce((acc, o) => acc + o.total, 0),
      orderCount: b._count.orders
    }));

    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const staffBranchRoles = ['BRANCH_OWNER', 'BRANCH_MANAGER', 'EMPLOYEE', 'TECHNICIAN'];

exports.getBranch = async (req, res) => {
  try {
    const branchId = Number(req.params.id);
    if (!Number.isFinite(branchId)) {
      return res.status(400).json({ message: 'Invalid branch id' });
    }

    if (staffBranchRoles.includes(req.user.role) && branchId !== req.user.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, location: true },
    });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const [orderGroups, revenue, totalAppointments] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { branchId },
        _count: { id: true },
      }),
      Report.getBranchRevenue(branchId),
      prisma.serviceBooking.count({ where: { branchId } }),
    ]);

    const countByStatus = (status) =>
      orderGroups.find((g) => g.status === status)?._count.id || 0;

    const totalOrders = orderGroups.reduce((sum, g) => sum + g._count.id, 0);

    res.json({
      ...branch,
      totalOrders,
      completedOrders: countByStatus('COMPLETED'),
      pendingOrders: countByStatus('PENDING'),
      totalAppointments,
      revenue: revenue._sum.total || 0,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const data = await Report.getSalesReport(Number(req.params.id));
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/** One request for branch dashboard — avoids 6 parallel calls and Hostinger/Vercel 429. */
exports.getBranchDashboard = async (req, res) => {
  try {
    const branchId = resolveBranchId(req);
    if (!branchId) {
      return res.status(400).json({ message: 'branchId is required for this dashboard.' });
    }

    const [revSummary, chartData, pendingCount, todayAppts, stockAlerts, recentOrders] =
      await Promise.all([
        Report.getRevenueSummary({ branchId }),
        Report.getRevenueChart({ branchId, days: 7 }),
        Order.countOrders({ branchId, status: 'PENDING' }),
        Booking.getTodayBookings(branchId),
        Inventory.getAlerts(branchId, false),
        Order.getOrders({ branchId, page: 1, limit: 5 }),
      ]);

    res.json({
      revSummary,
      chartData,
      pendingOrders: { count: pendingCount },
      todayAppts,
      stockAlerts,
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/** One request for owner dashboard — replaces 7 parallel client calls. */
exports.getOwnerDashboard = async (req, res) => {
  try {
    const compareBranches = async () => {
      const branches = await prisma.branch.findMany({
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { status: 'COMPLETED' },
            select: { total: true },
          },
        },
      });
      return branches.map((b) => ({
        name: b.name,
        revenue: b.orders.reduce((acc, o) => acc + o.total, 0),
        orderCount: b._count.orders,
      }));
    };

    const [
      branchCount,
      partsCount,
      orderCount,
      revSummary,
      topBranches,
      compareData,
      recentOrders,
    ] = await Promise.all([
      prisma.branch.count(),
      prisma.part.count(),
      prisma.order.count(),
      Report.getRevenueSummary({}),
      prisma.branch.findMany({
        take: 5,
        include: { _count: { select: { orders: true } } },
        orderBy: { orders: { _count: 'desc' } },
      }),
      compareBranches(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          walkInCustomer: { select: { name: true } },
          branch: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      branchCount,
      partsCount,
      orderCount,
      revSummary,
      topBranches,
      compareData,
      recentOrders,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
