// backend/src/modules/suppliers/supplier.model.js
const prisma = require('../../config/db');

const getAllSuppliers = () => prisma.supplier.findMany();
const createSupplier = (data) => prisma.supplier.create({ data });

module.exports = { getAllSuppliers, createSupplier };
