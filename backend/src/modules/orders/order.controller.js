// backend/src/modules/orders/order.controller.js
const Order = require('./order.model');

exports.create = async (req, res) => {
  try {
    const order = await Order.createOrder({ ...req.body, customerId: req.user.id });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = { ...req.query };
    // Enforce branchId for non-global owners
    if (req.user.role === 'BRANCH_OWNER' || req.user.role === 'EMPLOYEE') {
      query.branchId = req.user.branchId;
    }
    const result = await Order.getOrders(query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getCount = async (req, res) => {
  try {
    const { branchId, status, type } = req.query;
    const count = await Order.countOrders({ 
      branchId: branchId ? Number(branchId) : undefined,
      status: status || undefined,
      type: type || undefined
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.getOrderById(Number(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getByCustomer = async (req, res) => {
  try {
    const result = await Order.getOrders({ ...req.query, customerId: Number(req.params.id) });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const updated = await Order.updateOrderStatus(Number(req.params.id), req.body.status);
    res.json({ message: `Order status updated to ${req.body.status}`, order: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const result = await Order.getOrders({ ...req.query, customerId: req.user.id });
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
