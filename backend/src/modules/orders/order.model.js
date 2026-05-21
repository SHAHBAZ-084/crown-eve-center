// backend/src/modules/orders/order.model.js
const prisma = require('../../config/db');
const { syncInventoryToPartsAndProducts } = require('../inventory/inventory.utils');

/**
 * Posts double-entry ledger accounting entries for an order.
 * Handles walk-in credit sales, online customer credit sales, and bank payments.
 *
 * Walk-in  → LedgerEntry: DR walk-in receivable, CR revenue
 * Online   → LedgerEntry: DR customer account, CR revenue
 * Bank     → LedgerEntry: DR bank account, CR revenue + bank balance update
 *
 * @param {object} tx  - Prisma transaction client
 * @param {object} params - { orderId, branchId, total, customerId, walkInCustomerId, bankId }
 */
const postLedgerEntries = async (tx, { orderId, branchId, total, customerId, walkInCustomerId, bankId }) => {
  const bId = Number(branchId);

  // ── Helper: find or create an AccountCategory for this branch ──────────────
  const getOrCreateCategory = async (name) => {
    let cat = await tx.accountCategory.findFirst({ where: { name, branchId: bId } });
    if (!cat) {
      cat = await tx.accountCategory.create({
        data: { name, description: `System ${name} Ledgers`, branchId: bId }
      });
    }
    return cat;
  };

  // ── Helper: find or create an Account + its Ledger under a category ─────────
  const getOrCreateAccountLedger = async (categoryId, accountName) => {
    let acc = await tx.account.findFirst({
      where: { categoryId, account_name: accountName, branchId: bId }
    });
    if (!acc) {
      acc = await tx.account.create({
        data: { categoryId, account_name: accountName, branchId: bId, opening_balance: 0, current_balance: 0 }
      });
    }
    let ledger = await tx.ledger.findUnique({ where: { accountId: acc.id } });
    if (!ledger) {
      ledger = await tx.ledger.create({ data: { accountId: acc.id, ledger_name: accountName } });
    }
    return { account: acc, ledger };
  };

  // Shared Revenue account — CR side of all sales
  const revCat = await getOrCreateCategory('REVENUE');
  const { account: revAcc, ledger: revLedger } = await getOrCreateAccountLedger(revCat.id, 'Sales Revenue');

  if (walkInCustomerId) {
    // ── Walk-in credit sale: DR walk-in receivable, CR revenue ─────────────────
    const walkIn = await tx.walkInCustomer.findUnique({
      where: { id: walkInCustomerId },
      select: { accountId: true }
    });

    if (walkIn?.accountId) {
      // DR: Debit the walk-in customer's receivable account
      const custLedger = await tx.ledger.findUnique({ where: { accountId: walkIn.accountId } });
      if (custLedger) {
        await tx.ledgerEntry.create({
          data: { ledgerId: custLedger.id, debit: total, credit: 0, reference_type: 'SALE', description: `Invoice #${orderId}` }
        });
        await tx.account.update({ where: { id: walkIn.accountId }, data: { current_balance: { increment: total } } });
      }
    }

    // CR: Credit Sales Revenue
    await tx.ledgerEntry.create({
      data: { ledgerId: revLedger.id, debit: 0, credit: total, reference_type: 'SALE', description: `Invoice #${orderId}` }
    });
    await tx.account.update({ where: { id: revAcc.id }, data: { current_balance: { increment: total } } });

  } else if (customerId) {
    // ── Online customer sale: find/create their account, DR customer, CR revenue ─
    const custCat = await getOrCreateCategory('CUSTOMER');
    const user = await tx.user.findUnique({ where: { id: customerId }, select: { name: true } });
    const accName = `Online Customer - ${user?.name || customerId}`;
    const { account: custAcc, ledger: custLedger } = await getOrCreateAccountLedger(custCat.id, accName);

    // DR: Debit the online customer's receivable account
    await tx.ledgerEntry.create({
      data: { ledgerId: custLedger.id, debit: total, credit: 0, reference_type: 'SALE', description: `Online Invoice #${orderId}` }
    });
    await tx.account.update({ where: { id: custAcc.id }, data: { current_balance: { increment: total } } });

    // CR: Credit Sales Revenue
    await tx.ledgerEntry.create({
      data: { ledgerId: revLedger.id, debit: 0, credit: total, reference_type: 'SALE', description: `Online Invoice #${orderId}` }
    });
    await tx.account.update({ where: { id: revAcc.id }, data: { current_balance: { increment: total } } });
  }

  if (bankId) {
    // ── Bank payment: DR bank account, CR revenue (direct bank receipt) ─────────
    const bank = await tx.bank.findUnique({ where: { id: bankId }, select: { account_title: true } });
    const bankCat = await getOrCreateCategory('BANK');
    const bankAccName = bank?.account_title || 'Bank Account';
    const { account: bankAcc, ledger: bankLedger } = await getOrCreateAccountLedger(bankCat.id, bankAccName);

    // DR: Debit bank (money received into bank)
    await tx.ledgerEntry.create({
      data: { ledgerId: bankLedger.id, debit: total, credit: 0, reference_type: 'SALE', description: `Bank receipt Invoice #${orderId}` }
    });
    await tx.account.update({ where: { id: bankAcc.id }, data: { current_balance: { increment: total } } });

    // CR: Revenue — only if not already credited via a customer entry above (avoids double-posting)
    if (!walkInCustomerId && !customerId) {
      await tx.ledgerEntry.create({
        data: { ledgerId: revLedger.id, debit: 0, credit: total, reference_type: 'SALE', description: `Bank sale Invoice #${orderId}` }
      });
      await tx.account.update({ where: { id: revAcc.id }, data: { current_balance: { increment: total } } });
    }
  }
};

const createOrder = async (data) => {
  const {
    branchId, customerId, walkInCustomerId, bankId, total, type,
    payment_method, payment_status, payment_screenshot, transaction_id,
    tracking_id, customer_name, customer_phone, notes, items
  } = data;

  return prisma.$transaction(async (tx) => {
    // Fix 3: Idempotency guard — return the existing order if this transaction_id was already processed
    if (transaction_id) {
      const existingOrder = await tx.order.findFirst({ where: { transaction_id } });
      if (existingOrder) {
        return existingOrder;
      }
    }

    // 0. Atomically verify stock availability AND deduct in one operation — eliminates race conditions (Bug 1)
    //    updateMany with stock_qty: { gte: qty } as the guard — count === 0 means another concurrent
    //    request already consumed the stock between our check and this update.
    for (const item of items) {
      const pId = item.productId || item.id;
      const qtyRequested = Number(item.quantity || item.qty);

      // Read the product name first for informative error messages (read-only)
      const product = await tx.product.findUnique({
        where: { id: pId },
        select: { name: true }
      });

      if (!product) {
        throw new Error('Product not found.');
      }

      // Atomic check-and-decrement: only succeeds if current stock_qty >= qtyRequested
      const result = await tx.product.updateMany({
        where: { id: pId, stock_qty: { gte: qtyRequested } },
        data: { stock_qty: { decrement: qtyRequested } }
      });

      if (result.count === 0) {
        throw new Error(`Insufficient stock for product "${product.name}". Requested: ${qtyRequested}.`);
      }
    }

    // 1. Create the order
    const order = await tx.order.create({
      data: {
        branchId: Number(branchId),
        customerId: customerId || undefined,
        walkInCustomerId: walkInCustomerId || undefined,
        bankId: bankId || undefined,
        total: Number(total),
        type: type || 'POS',
        status: type === 'POS' ? 'COMPLETED' : 'PENDING',
        payment_method: payment_method || 'CASH',
        payment_status: payment_status || 'PENDING',
        payment_screenshot,
        transaction_id,
        tracking_id,
        customer_name,
        customer_phone,
        notes,
        items: {
          create: items.map(item => ({
            productId: item.productId || item.id,
            quantity: Number(item.quantity || item.qty),
            price: Number(item.price)
          }))
        }
      },
      include: { items: { include: { product: { include: { productParts: true } } } } }
    });

    // 2. Handle parts inventory for composite products (Bug 3 + Bug 5)
    //
    //    Standalone products (productParts.length === 0): stock_qty was already atomically
    //    decremented in Step 0. Nothing more to do here.
    //
    //    Composite products (productParts.length > 0): stock_qty was also decremented in
    //    Step 0, but syncInventoryToPartsAndProducts will recalculate and overwrite it from
    //    the parts inventory — parts are the single source of truth for composite stock.
    //    We do NOT do a second product.update decrement here (Bug 3 fix).
    for (const item of order.items) {
      if (!item.product) continue;

      const quantitySold = Number(item.quantity);

      // Only process parts deduction for composite products
      if (item.product.productParts && item.product.productParts.length > 0) {
        for (const productPart of item.product.productParts) {
          const qtyToDeduct = productPart.quantity * quantitySold;

          // Find the inventory record for this part at this branch
          const inv = await tx.inventory.findUnique({
            where: {
              branchId_partId: {
                branchId: Number(branchId),
                partId: Number(productPart.partId)
              }
            }
          });

          // Bug 5: Throw instead of silently creating negative stock — a missing inventory
          // record means the part was never stocked at this branch, which is a data error.
          if (!inv) {
            throw new Error(
              `Part ID ${productPart.partId} has no inventory record at branch ${branchId}. ` +
              `Stock the part before selling products that use it.`
            );
          }

          await tx.inventory.update({
            where: { id: inv.id },
            data: { stock: { decrement: qtyToDeduct } }
          });

          // Sync product.stock_qty back from parts inventory (parts are source of truth for composites)
          await syncInventoryToPartsAndProducts(tx, branchId, productPart.partId);
        }
      }
    }

    // 3. Handle Walk-in Customer Debit (Credit Sale) — updates outstanding balance
    if (order.walkInCustomerId) {
      await tx.walkInCustomer.update({
        where: { id: order.walkInCustomerId },
        data: { balance: { increment: Number(total) } }
      });

      await tx.walkInCustomerLedger.create({
        data: {
          customerId: order.walkInCustomerId,
          amount: Number(total),
          type: 'DEBIT',
          description: `Sale Invoice #${order.id} - ${type === 'POS' ? 'POS Terminal' : 'Online Order'}`,
          orderId: order.id
        }
      });
    } else if (bankId) {
      // 4. Update Bank Balance for non-walkin bank payments
      await tx.bank.update({
        where: { id: bankId },
        data: { current_balance: { increment: Number(total) } }
      });
    }

    // 5. Post double-entry ledger entries for all customer types (Bug 2)
    await postLedgerEntries(tx, {
      orderId: order.id,
      branchId,
      total: Number(total),
      customerId,
      walkInCustomerId: order.walkInCustomerId,
      bankId
    });

    return order;
  });
};

const getOrders = async ({ page = 1, limit = 20, branchId, status, type, customerId }) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(status && { status }),
    ...(type && { type }),
    ...(customerId && { customerId: String(customerId) }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        payment_status: true,
        payment_screenshot: true,
        total: true,
        createdAt: true,
        type: true,
        payment_method: true,
        transaction_id: true,
        tracking_id: true,
        customer_name: true,
        customer_phone: true,
        customer: {
          select: { id: true, name: true }
        },
        walkInCustomer: {
          select: { id: true, first_name: true, last_name: true }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { name: true } }
          }
        }
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const countOrders = (where) => prisma.order.count({ where });

const getOrderById = (id) => prisma.order.findUnique({ 
  where: { id }, 
  select: {
    id: true,
    status: true,
    payment_status: true,
    payment_screenshot: true,
    transaction_id: true,
    tracking_id: true,
    total: true,
    createdAt: true,
    branch: { 
      select: { 
        id: true, 
        name: true, 
        phone: true, 
        whatsapp: true, 
        location: true,
        banks: {
          select: { name: true, account_number: true, account_title: true },
          take: 1
        }
      } 
    },
    customer: { select: { id: true, name: true, email: true } },
    items: {
      select: {
        quantity: true,
        price: true,
        product: { select: { name: true, price: true } }
      }
    }
  }
});

const updateOrder = (id, data) => prisma.order.update({ 
  where: { id }, 
  data,
  select: { id: true, status: true, payment_status: true, tracking_id: true }
});

module.exports = { createOrder, getOrders, countOrders, getOrderById, updateOrder };
