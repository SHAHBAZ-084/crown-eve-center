// backend/src/modules/suppliers/supplier.model.js
const prisma = require('../../config/db');
const { ensureSupplierAccount } = require('../../services/ledger.service');

const getAllSuppliers = () =>
  prisma.supplier.findMany({
    include: { account: { select: { id: true, account_name: true, current_balance: true } } },
  });

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
