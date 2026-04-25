// backend/src/modules/orders/order.schema.js
const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    branchId: z.number().int().positive(),
    customerId: z.number().int().positive().optional(),
    type: z.enum(['POS', 'ONLINE']),
    notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().min(1),
      price: z.number().positive(),
    })).min(1),
    total: z.number().positive(),
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
  })
});

module.exports = { createOrderSchema, updateStatusSchema };
