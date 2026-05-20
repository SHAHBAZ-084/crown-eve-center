// backend/src/modules/users/user.model.js
const prisma = require('../../config/db');

const getAllUsers = (branchId) => prisma.user.findMany({
  where: branchId ? { branchId } : {},
  select: { id: true, name: true, email: true, role: true, branchId: true, createdAt: true }
});

const getUserById = (id) => prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true, role: true, branchId: true }
});

const createUser = (data) => prisma.user.create({ data });

const updateUser = (id, data) => prisma.user.update({
  where: { id },
  data
});

const deleteUser = (id) => prisma.user.delete({
  where: { id }
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
