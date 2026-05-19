// backend/src/modules/accounts/account.controller.js
const prisma = require('../../config/db');

// Get all accounts (with optional category and branch filtering)
exports.getAll = async (req, res) => {
  try {
    const { branchId, categoryId } = req.query;
    const where = {};
    
    if (branchId) {
      where.branchId = parseInt(branchId);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const accounts = await prisma.account.findMany({
      where,
      include: {
        category: true,
        ledger: {
          include: {
            entries: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: accounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new Account (Automatically provisions Ledger & inserts Opening Balance entry)
exports.create = async (req, res) => {
  try {
    const { categoryId, account_name, opening_balance, branchId } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    if (!account_name) {
      return res.status(400).json({ message: 'Account name is required' });
    }
    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    // Run database transaction to ensure atomicity of Account, Ledger & Entry creation
    const account = await prisma.$transaction(async (tx) => {
      // 1. Create the Account
      const newAccount = await tx.account.create({
        data: {
          categoryId,
          account_name,
          opening_balance: parseFloat(opening_balance) || 0,
          current_balance: parseFloat(opening_balance) || 0,
          branchId: parseInt(branchId),
          status: 'ACTIVE'
        },
        include: {
          category: true
        }
      });

      // 2. Create the Ledger for that Account
      const ledger = await tx.ledger.create({
        data: {
          accountId: newAccount.id,
          ledger_name: `${newAccount.account_name} Ledger`
        }
      });

      // 3. Create Opening Balance Entry in Ledger
      const initialBal = parseFloat(opening_balance) || 0;
      if (initialBal > 0) {
        const categoryLower = newAccount.category.name.toLowerCase();
        let debit = 0;
        let credit = 0;

        // Assets (Cash, Bank, Asset) & Expenses increase with DEBIT
        // Liabilities, Equity, & Revenue (Services) increase with CREDIT
        if (
          categoryLower.includes('bank') ||
          categoryLower.includes('cash') ||
          categoryLower.includes('asset') ||
          categoryLower.includes('expense')
        ) {
          debit = initialBal;
        } else {
          credit = initialBal;
        }

        await tx.ledgerEntry.create({
          data: {
            ledgerId: ledger.id,
            debit,
            credit,
            reference_type: 'OPENING_BALANCE',
            description: `Opening balance for ${newAccount.account_name}`
          }
        });
      }

      return newAccount;
    });

    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update/Deactivate Account
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_name, status, categoryId } = req.body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        account_name,
        status,
        categoryId
      },
      include: {
        category: true
      }
    });

    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
