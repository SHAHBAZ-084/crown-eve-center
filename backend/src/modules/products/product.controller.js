// backend/src/modules/products/product.controller.js
const Product = require('./product.model');

exports.getAll = async (req, res) => {
  try {
    const result = await Product.getProducts(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, branchId, parts } = req.body;
    const product = await Product.createProduct({
      name,
      price,
      branchId: Number(branchId),
      parts: {
        create: parts.map(p => ({
          partId: p.partId,
          quantity: p.quantity
        }))
      }
    });
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, parts } = req.body;
    const data = {
      name,
      price,
      parts: parts ? {
        deleteMany: {},
        create: parts.map(p => ({
          partId: p.partId,
          quantity: p.quantity
        }))
      } : undefined
    };
    const product = await Product.updateProduct(Number(req.params.id), data);
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Product.deleteProduct(Number(req.params.id));
    res.json({ message: 'Product deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
