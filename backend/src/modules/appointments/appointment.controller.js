// backend/src/modules/appointments/appointment.controller.js
const Appointment = require('./appointment.model');
const prisma = require('../../config/db');

exports.getToday = async (req, res) => {
  try {
    const { branchId, techId } = req.query;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        branchId: branchId ? Number(branchId) : undefined,
        techId: techId ? Number(techId) : undefined,
        scheduledAt: { gte: startOfToday, lte: endOfToday }
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        technician: { select: { name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(appointments);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = { ...req.query };
    if (req.user.role === 'TECHNICIAN') {
      query.techId = req.user.id;
    }
    const result = await Appointment.getAppointments(query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const result = await Appointment.getAppointments({ ...req.query, customerId: req.user.id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { serviceId, branchId, scheduledAt } = req.body;
    const appointment = await Appointment.createAppointment({
      customerId: req.user.id,
      serviceId: Number(serviceId),
      branchId: Number(branchId),
      scheduledAt: new Date(scheduledAt)
    });
    res.status(201).json(appointment);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, techId } = req.body;
    const appointment = await Appointment.updateStatus(Number(req.params.id), {
      status,
      techId: techId ? Number(techId) : undefined
    });
    res.json(appointment);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
