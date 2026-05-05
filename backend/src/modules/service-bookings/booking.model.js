// backend/src/modules/service-bookings/booking.model.js
const prisma = require('../../config/db');

const getAllBookings = (filters = {}) => {
  const where = {};
  if (filters.branchId) where.branchId = Number(filters.branchId);
  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.status) where.status = filters.status;

  return prisma.serviceBooking.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      service: { select: { name: true, base_price: true } },
      technician: { select: { name: true } },
      branch: { select: { name: true } }
    },
    orderBy: { booking_date: 'desc' }
  });
};

const getBookingById = (id) => prisma.serviceBooking.findUnique({
  where: { id },
  include: {
    customer: true,
    service: true,
    technician: true
  }
});

const createBooking = (data) => prisma.serviceBooking.create({ 
  data: {
    ...data,
    booking_date: new Date(data.booking_date)
  } 
});

const updateBooking = (id, data) => {
  const updateData = { ...data };
  if (data.booking_date) updateData.booking_date = new Date(data.booking_date);
  
  return prisma.serviceBooking.update({
    where: { id },
    data: updateData
  });
};

const deleteBooking = (id) => prisma.serviceBooking.delete({ where: { id } });

module.exports = { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking };
