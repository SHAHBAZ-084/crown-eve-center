// backend/src/modules/branches/branch.controller.js
const prisma = require('../../config/db');

exports.getCount = async (req, res) => {
  try {
    const count = await prisma.branch.count();
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getTop = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    // For now, "top" means most orders, we can refine this
    const branches = await prisma.branch.findMany({
      take: Number(limit),
      include: {
        _count: { select: { orders: true } }
      },
      orderBy: { orders: { _count: 'desc' } }
    });
    res.json(branches);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        skip,
        take: limit,
        include: { _count: { select: { users: true, products: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.branch.count()
    ]);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: Number(req.params.id) },
      include: { users: { select: { id: true, name: true, role: true } } }
    });
    res.json(branch);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const branch = await prisma.branch.create({ data: req.body });
    res.status(201).json(branch);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const branch = await prisma.branch.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(branch);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.branch.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Branch deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
