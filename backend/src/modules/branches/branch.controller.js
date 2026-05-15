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

exports.getAvailable = async (req, res) => {
  try {
    const { slugs } = req.query; // Expecting comma separated slugs
    if (!slugs) return res.json([]);
    const slugList = slugs.split(',');

    const branches = await prisma.branch.findMany({
      where: {
        products: {
          some: {
            slug: { in: slugList },
            stock_qty: { gt: 0 }
          }
        }
      },
      include: {
        products: {
          where: {
            slug: { in: slugList },
            stock_qty: { gt: 0 }
          },
          select: { slug: true, name: true, stock_qty: true }
        }
      }
    });

    const results = branches.map(b => {
      const branchSlugs = b.products.map(p => p.slug);
      const missing = slugList.filter(s => !branchSlugs.includes(s));
      const available = slugList.filter(s => branchSlugs.includes(s));
      
      return {
        ...b,
        availability: {
          isFull: missing.length === 0,
          availableCount: available.length,
          totalRequested: slugList.length,
          missingSlugs: missing,
          availableSlugs: available
        }
      };
    });

    // Sort: Full availability first, then by available count
    results.sort((a, b) => {
      if (a.availability.isFull && !b.availability.isFull) return -1;
      if (!a.availability.isFull && b.availability.isFull) return 1;
      return b.availability.availableCount - a.availability.availableCount;
    });

    res.json(results);
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

exports.getBanks = async (req, res) => {
  try {
    const banks = await prisma.bank.findMany({
      where: { branchId: Number(req.params.id) }
    });
    res.json(banks);
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
    const id = Number(req.params.id);
    if (req.user.role === 'BRANCH_OWNER' && req.user.branchId !== id) {
      return res.status(403).json({ message: "You can only update your own branch" });
    }
    const branch = await prisma.branch.update({
      where: { id },
      data: req.body
    });
    res.json(branch);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete purchase items for this branch's purchases
      const purchases = await tx.purchase.findMany({ where: { branchId: id }, select: { id: true } });
      const purchaseIds = purchases.map(p => p.id);
      if (purchaseIds.length > 0) {
        await tx.purchaseItem.deleteMany({ where: { purchaseId: { in: purchaseIds } } });
      }

      // 2. Delete order items for this branch's orders
      const orders = await tx.order.findMany({ where: { branchId: id }, select: { id: true } });
      const orderIds = orders.map(o => o.id);
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      }

      // 2b. Delete order items referencing this branch's products (even if order is from another branch)
      const products = await tx.product.findMany({ where: { branchId: id }, select: { id: true } });
      const productIds = products.map(p => p.id);
      if (productIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { productId: { in: productIds } } });
      }

      // 2c. Delete appointments referencing this branch's services (even if appointment is in another branch)
      const services = await tx.service.findMany({ where: { branchId: id }, select: { id: true } });
      const serviceIds = services.map(s => s.id);
      if (serviceIds.length > 0) {
        await tx.appointment.deleteMany({ where: { serviceId: { in: serviceIds } } });
      }

      // 3. Delete direct children
      await tx.appointment.deleteMany({ where: { branchId: id } });
      await tx.order.deleteMany({ where: { branchId: id } });
      await tx.purchase.deleteMany({ where: { branchId: id } });
      await tx.inventory.deleteMany({ where: { branchId: id } });
      await tx.product.deleteMany({ where: { branchId: id } });
      await tx.service.deleteMany({ where: { branchId: id } });

      // 4. Unassign users (don't delete users — just detach from branch)
      await tx.user.updateMany({ 
        where: { branchId: id }, 
        data: { branchId: null } 
      });

      // 5. Finally delete the branch
      await tx.branch.delete({ where: { id } });
    }, {
      timeout: 30000 // 30 seconds
    });

    res.json({ message: 'Branch deleted successfully' });
  } catch (e) {
    const logger = require('../../config/logger');
    logger.error('Branch Deletion Failed', { branchId: id, error: e.message, stack: e.stack });
    res.status(500).json({ 
      message: 'Failed to delete branch. This usually happens if there are complex data relations that couldn\'t be cleaned up automatically.',
      error: e.message 
    });
  }
};
