// backend/src/modules/services/service.controller.js
const Service = require('./service.model');

exports.getAll = async (req, res) => {
  try {
    const { branchId } = req.query;
    const services = await Service.getAllServices(branchId ? Number(branchId) : undefined);
    res.json(services);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const service = await Service.createService(req.body);
    res.status(201).json(service);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const service = await Service.updateService(Number(req.params.id), req.body);
    res.json(service);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Service.deleteService(Number(req.params.id));
    res.json({ message: 'Service deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
