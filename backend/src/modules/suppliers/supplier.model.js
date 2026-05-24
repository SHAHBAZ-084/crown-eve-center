// backend/src/modules/suppliers/supplier.model.js
const prisma = require('../../config/db');
const { ensureSupplierAccount } = require('../../services/ledger.service');

const getAllSuppliers = ({ page = 1, limit = 100 } = {}) => {
  const take = Math.min(Number(limit) || 100, 200);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  return prisma.$transaction([
    prisma.supplier.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        contact: true,
        accountId: true,
        account: { select: { id: true, account_name: true, current_balance: true } },
      },
    }),
    prisma.supplier.count(),
  ]).then(([data, total]) => ({
    data,
    meta: { total, page: Number(page) || 1, limit: take, totalPages: Math.ceil(total / take) },
  }));
};

const createSupplier = async (data) => {
  const { branchId, ...supplierData } = data;
  const bId = branchId ? Number(branchId) : (await prisma.branch.findFirst({ select: { id: true } }))?.id;
  if (!bId) throw new Error('Branch ID is required to create supplier ledger.');

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({ data: supplierData });
    await ensureSupplierAccount(tx, supplier.id, bId);
    return tx.supplier.findUnique({
      where: { id: supplier.id },
      include: { account: true },
    });
  });
};

module.exports = { getAllSuppliers, createSupplier };
