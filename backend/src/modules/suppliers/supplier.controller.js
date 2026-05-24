// backend/src/modules/suppliers/supplier.controller.js
const Supplier = require('./supplier.model');

exports.getAll = async (req, res) => {
  try {
    const result = await Supplier.getAllSuppliers(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await Supplier.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
