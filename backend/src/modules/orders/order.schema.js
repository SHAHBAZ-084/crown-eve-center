// backend/src/modules/orders/order.schema.js
const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    branchId: z.number().int().positive(),
    customerId: z.string().optional().nullable(),
    type: z.enum(['POS', 'ONLINE']),
    payment_method: z.string().optional(),
    transaction_id: z.string().optional().nullable(),
    customer_name: z.string().optional().nullable(),
    customer_phone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
    })).min(1),
    total: z.number().min(0),
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
  })
});

module.exports = { createOrderSchema, updateStatusSchema };
