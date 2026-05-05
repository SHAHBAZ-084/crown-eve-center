// backend/src/modules/orders/order.controller.js
const Order = require('./order.model');

const prisma = require('../../config/db');

exports.create = async (req, res) => {
  try {
    const customerId = req.user.role === 'CUSTOMER' ? req.user.id : (req.body.customerId || null);
    const order = await Order.createOrder({ ...req.body, customerId });
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

    if (req.user.role === 'CUSTOMER' && order.customer.id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getByCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    
    // Security check: Customers can only fetch their own orders
    if (req.user.role === 'CUSTOMER' && req.user.id !== customerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await Order.getOrders({ ...req.query, customerId });
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
