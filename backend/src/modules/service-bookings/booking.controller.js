// backend/src/modules/service-bookings/booking.controller.js
const Booking = require('./booking.model');

exports.getAll = async (req, res) => {
  try {
    const filters = { ...req.query };
    if (req.role === 'BRANCH_MANAGER' || req.role === 'BRANCH_OWNER') {
      filters.branchId = req.branchId;
    } else if (req.role === 'CUSTOMER') {
      filters.customerId = req.user.id;
    }
    const bookings = await Booking.getAllBookings(filters);
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const booking = await Booking.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = {
      ...req.body,
      customerId: req.user.id, // Current logged in user is the customer
      status: 'pending'
    };
    const booking = await Booking.createBooking(data);
    res.status(201).json(booking);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const booking = await Booking.updateBooking(req.params.id, req.body);
    res.json(booking);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    res.json({ message: 'Booking deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getToday = async (req, res) => {
  try {
    const { branchId } = req.query;
    const bookings = await Booking.getTodayBookings(branchId);
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
