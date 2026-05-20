// backend/src/modules/auth/auth.schema.js
const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    role: z.string().optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
});

module.exports = { registerSchema, loginSchema };
