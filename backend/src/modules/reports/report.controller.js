// backend/src/modules/reports/report.controller.js
const Report = require('./report.model');
const prisma = require('../../config/db');

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

exports.getBranch = async (req, res) => {
  try {
    const branchId = Number(req.params.id);
    if (req.user.role === 'BRANCH_OWNER' && branchId !== req.user.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const stats = await Report.getBranchStats(branchId);
    const revenue = await Report.getBranchRevenue(branchId);
    res.json({ ...stats, revenue: revenue._sum.total || 0 });
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
