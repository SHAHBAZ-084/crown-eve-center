// backend/src/modules/suppliers/supplier.model.js
const prisma = require('../../config/db');

const getAllSuppliers = () => prisma.supplier.findMany();
const createSupplier = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({ data });
    
    const branch = await tx.branch.findFirst();
    if (!branch) return supplier;

    let cat = await tx.accountCategory.findFirst({
      where: { name: 'Suppliers', branchId: branch.id }
    });
    
    if (!cat) {
      cat = await tx.accountCategory.create({
        data: { name: 'Suppliers', description: 'System Supplier Ledgers', branchId: branch.id }
      });
    }

    const acc = await tx.account.create({
      data: {
        categoryId: cat.id,
        account_name: `${supplier.name} (${supplier.contact})`,
        current_balance: 0,
        branchId: branch.id,
        ledger: { create: { ledger_name: `${supplier.name} - Ledger` } }
      }
    });

    return await tx.supplier.update({
      where: { id: supplier.id },
      data: { accountId: acc.id }
    });
  });
};

module.exports = { getAllSuppliers, createSupplier };
