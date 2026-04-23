// backend/src/modules/parts/part.controller.js
const Part = require('./part.model');
const prisma = require('../../config/db');

exports.getCount = async (req, res) => {
  try {
    const count = await prisma.part.count();
    res.json({ count });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await Part.getParts(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const part = await Part.getPartById(Number(req.params.id));
    res.json(part);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const part = await Part.createPart(req.body);
    res.status(201).json(part);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const part = await Part.updatePart(Number(req.params.id), req.body);
    res.json(part);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.part.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Part deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
