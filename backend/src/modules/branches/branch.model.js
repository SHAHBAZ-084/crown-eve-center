// backend/src/modules/branches/branch.model.js
const prisma = require('../../config/db');

const getAllBranches = () => prisma.branch.findMany({
  include: {
    _count: {
      select: { users: true, products: true, services: true }
    }
  }
});

const getBranchById = (id) => prisma.branch.findUnique({
  where: { id },
  include: {
    users: { select: { id: true, name: true, role: true } },
    products: true,
    services: true,
    inventory: { include: { part: true } }
  }
});

const createBranch = (data) => prisma.branch.create({ data });

const updateBranch = (id, data) => prisma.branch.update({
  where: { id },
  data
});

const deleteBranch = (id) => prisma.branch.delete({
  where: { id }
});

module.exports = { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch };
