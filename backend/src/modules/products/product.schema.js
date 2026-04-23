// backend/src/modules/products/product.schema.js
const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    price: z.number().positive(),
    branchId: z.number().int().positive(),
    parts: z.array(z.object({
      partId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })).min(1),
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    parts: z.array(z.object({
      partId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })).min(1).optional(),
  })
});

module.exports = { createProductSchema, updateProductSchema };
