// backend/src/modules/appointments/appointment.model.js
const prisma = require('../../config/db');

const getAppointments = async ({ page = 1, limit = 20, branchId, customerId, techId, status }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(branchId && { branchId: Number(branchId) }),
    ...(customerId && { customerId: Number(customerId) }),
    ...(techId && { techId: Number(techId) }),
    ...(status && { status })
  };

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        customer: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
        technician: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } }
      },
      orderBy: { scheduledAt: 'desc' }
    }),
    prisma.appointment.count({ where })
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const createAppointment = (data) => prisma.appointment.create({ 
  data,
  select: { id: true, scheduledAt: true, status: true }
});

const updateStatus = (id, data) => prisma.appointment.update({
  where: { id },
  data,
  select: { id: true, status: true, techId: true }
});

module.exports = { getAppointments, createAppointment, updateStatus };
