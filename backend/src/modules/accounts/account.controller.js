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

// Delete Account
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account has any vouchers linked
    const vouchersCount = await prisma.voucher.count({
      where: {
        OR: [
          { fromAccountId: id },
          { toAccountId: id }
        ]
      }
    });

    if (vouchersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account. There are vouchers attached to this ledger. Please deactivate it instead.' 
      });
    }

    await prisma.account.delete({
      where: { id }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate Ledger Statement
exports.getLedgerStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const account = await prisma.account.findUnique({
      where: { id },
      include: { category: true, ledger: true }
    });

    if (!account || !account.ledger) {
      return res.status(404).json({ message: 'Account or Ledger not found.' });
    }

    const catName = account.category.name.toLowerCase();
    
    // Determine Account Nature
    // Customers = Asset (Accounts Receivable)
    // Cash/Bank = Asset
    // Expense/Purchase = Expense
    const isDebitNature = 
      catName.includes('bank') || 
      catName.includes('cash') || 
      catName.includes('asset') || 
      catName.includes('expense') ||
      catName.includes('customer') ||
      catName.includes('purchase');

    // Fetch entries
    const allEntries = await prisma.ledgerEntry.findMany({
      where: { ledgerId: account.ledger.id },
      orderBy: { createdAt: 'asc' }
    });

    let openingBalance = account.opening_balance || 0;
    
    // Calculate opening balance up to startDate
    const start = startDate ? new Date(startDate) : new Date(0);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const previousEntries = allEntries.filter(e => new Date(e.createdAt) < start);
    const periodEntries = allEntries.filter(e => {
      const d = new Date(e.createdAt);
      return d >= start && d <= end;
    });

    // Calculate opening balance using global rule: Balance = Debit - Credit
    // Wait, the account.opening_balance might be saved based on its nature. 
    // To strictly enforce Balance = Debit - Credit globally from transaction zero:
    // If opening_balance was saved as absolute number, we must ensure it maps correctly.
    // Assuming opening_balance in DB is an absolute value (e.g. 5000), if it's a CREDIT nature account (like a Supplier), it should mathematically start as -5000 in the strict Dr-Cr formula.
    if (!isDebitNature && openingBalance > 0) {
      openingBalance = -openingBalance;
    }

    for (const entry of previousEntries) {
      openingBalance = openingBalance + entry.debit - entry.credit;
    }

    // Prepare statement rows
    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    const rows = periodEntries.map(entry => {
      totalDebit += entry.debit;
      totalCredit += entry.credit;

      // Strict Rule: Balance = Debit - Credit
      runningBalance = runningBalance + entry.debit - entry.credit;

      return {
        id: entry.id,
        date: entry.createdAt,
        reference_type: entry.reference_type,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        balance: Math.abs(runningBalance),
        balanceType: runningBalance > 0 ? 'Dr' : (runningBalance < 0 ? 'Cr' : '')
      };
    });

    res.json({
      accountName: account.account_name,
      categoryName: account.category.name,
      nature: isDebitNature ? 'DEBIT' : 'CREDIT',
      openingBalance: Math.abs(openingBalance),
      openingBalanceType: openingBalance > 0 ? 'Dr' : (openingBalance < 0 ? 'Cr' : ''),
      totalDebit,
      totalCredit,
      closingBalance: Math.abs(runningBalance),
      closingBalanceType: runningBalance > 0 ? 'Dr' : (runningBalance < 0 ? 'Cr' : ''),
      entries: rows
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate Trial Balance
exports.getTrialBalance = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    const where = {};
    if (branchId) {
      where.branchId = parseInt(branchId);
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
      }
    });

    let report = [];
    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    const start = startDate ? new Date(startDate) : new Date(0);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    for (const acc of accounts) {
      if (!acc.ledger) continue;

      const catName = acc.category.name.toLowerCase();
      const isDebitNature = 
        catName.includes('bank') || 
        catName.includes('cash') || 
        catName.includes('asset') || 
        catName.includes('expense') ||
        catName.includes('customer') ||
        catName.includes('purchase');

      // Adjust Opening Balance logic
      let openingBalance = acc.opening_balance || 0;
      if (!isDebitNature && openingBalance > 0) {
        openingBalance = -openingBalance;
      }

      let runningBalance = openingBalance;
      let periodDebit = 0;
      let periodCredit = 0;

      for (const entry of acc.ledger.entries) {
        const entryDate = new Date(entry.createdAt);
        
        if (entryDate > end) continue;

        if (entryDate < start) {
          runningBalance += entry.debit - entry.credit;
        } else {
          periodDebit += entry.debit;
          periodCredit += entry.credit;
          runningBalance += entry.debit - entry.credit;
        }
      }

      const closingBalance = runningBalance;
      // Precision fix
      const roundedBal = Math.round(closingBalance * 100) / 100;
      const drBal = roundedBal > 0 ? roundedBal : 0;
      const crBal = roundedBal < 0 ? Math.abs(roundedBal) : 0;

      if (drBal !== 0 || crBal !== 0 || periodDebit !== 0 || periodCredit !== 0) {
        grandTotalDebit += drBal;
        grandTotalCredit += crBal;

        report.push({
          accountId: acc.id,
          accountName: acc.account_name,
          categoryName: acc.category.name,
          nature: isDebitNature ? 'Debit' : 'Credit',
          openingBalance: runningBalance - periodDebit + periodCredit,
          periodDebit,
          periodCredit,
          closingDebit: drBal,
          closingCredit: crBal,
          closingBalance: roundedBal
        });
      }
    }

    report.sort((a, b) => a.accountName.localeCompare(b.accountName));

    res.json({
      report,
      grandTotalDebit: Math.round(grandTotalDebit * 100) / 100,
      grandTotalCredit: Math.round(grandTotalCredit * 100) / 100
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
