// backend/src/modules/services/service.model.js
const prisma = require('../../config/db');

const getAllServices = (branchId) => prisma.service.findMany({
  where: branchId ? { branchId } : {},
  include: { branch: { select: { name: true } } }
});

const createService = (data) => prisma.service.create({ data });

const updateService = (id, data) => prisma.service.update({ where: { id }, data });

const deleteService = (id) => prisma.service.delete({ where: { id } });

module.exports = { getAllServices, createService, updateService, deleteService };
