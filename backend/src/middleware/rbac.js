// backend/src/middleware/rbac.js
const allow = (...roles) => (req, res, next) => {
  // MASTER BYPASS FOR OWNER EMAIL
  if (req.user.email === 'owner@crowneve.com') return next();

  if (!roles.includes(req.user.role)) {
    console.log(`[RBAC] Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${roles.join(', ')}`);
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { allow };
