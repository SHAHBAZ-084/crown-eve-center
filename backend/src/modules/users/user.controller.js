// backend/src/modules/users/user.controller.js
const User = require('./user.model');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    let { branchId } = req.query;
    if (req.user.role === 'BRANCH_OWNER' || req.user.role === 'EMPLOYEE') {
      branchId = req.user.branchId;
    }
    const users = await User.getAllUsers(branchId ? Number(branchId) : undefined);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role, branchId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Enforce branchId for Branch Owners
    const finalBranchId = req.user.role === 'BRANCH_OWNER' ? req.user.branchId : (branchId ? Number(branchId) : null);

    const user = await User.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      branchId: finalBranchId
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, phone, branchId, role } = req.body;
    
    // Whitelist only safe fields for general updates
    const safeData = { name, email, phone };
    
    // Only COMPANY_OWNER can change role or branch assignment
    if (req.user.role === 'COMPANY_OWNER') {
      if (role) safeData.role = role;
      if (branchId !== undefined) safeData.branchId = branchId ? Number(branchId) : null;
    }

    const user = await User.updateUser(Number(req.params.id), safeData);
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await User.deleteUser(Number(req.params.id));
    res.json({ message: 'User removed successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
