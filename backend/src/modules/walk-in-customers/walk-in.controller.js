const prisma = require('../../config/db');

exports.getAll = async (req, res) => {
  try {
    const { branchId, search } = req.query;
    const where = {
      branchId: branchId ? parseInt(branchId) : undefined,
      OR: search ? [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { cnic: { contains: search, mode: 'insensitive' } },
      ] : undefined
    };

    const customers = await prisma.walkInCustomer.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { first_name, last_name, cnic, phone, whatsapp, address, email, branchId } = req.body;
    
    if (!branchId) {
        return res.status(400).json({ message: 'Branch ID is required' });
    }

    const customer = await prisma.$transaction(async (tx) => {
      const cust = await tx.walkInCustomer.create({
        data: {
          first_name,
          last_name,
          cnic,
          phone,
          whatsapp,
          address,
          email,
          branchId: parseInt(branchId)
        }
      });

      let cat = await tx.accountCategory.findFirst({ 
        where: { name: 'Customers', branchId: parseInt(branchId) } 
      });
      
      if (!cat) {
        cat = await tx.accountCategory.create({ 
          data: { name: 'Customers', description: 'System Customer Ledgers', branchId: parseInt(branchId) } 
        });
      }

      const acc = await tx.account.create({
        data: {
          categoryId: cat.id,
          account_name: `${first_name} ${last_name} (${phone})`,
          current_balance: 0,
          branchId: parseInt(branchId),
          ledger: { create: { ledger_name: `${first_name} ${last_name} - Ledger` } }
        }
      });

      return await tx.walkInCustomer.update({
        where: { id: cust.id },
        data: { accountId: acc.id }
      });
    });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
