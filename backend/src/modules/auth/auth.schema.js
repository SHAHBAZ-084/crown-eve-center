// backend/src/modules/auth/auth.schema.js
const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
});

module.exports = { registerSchema, loginSchema };
