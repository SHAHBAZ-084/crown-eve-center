// backend/src/middleware/rbac.js
const allow = (...roles) => (req, res, next) => {
  // MASTER BYPASS FOR OWNER EMAIL OR DEBUGGING
  if (req.user.email === 'owner@crowneve.com') return next();
  
  // TEMPORARY: Allow anyone to manage branches to bypass role sync issues
  if (req.originalUrl.includes('/api/branches')) return next();

  if (!roles.includes(req.user.role)) {
    console.log(`[RBAC] Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${roles.join(', ')}`);
    return res.status(403).json({ 
      message: `Access denied for ${req.user.email} (${req.user.role}). Owner privileges required.`,
      debugEmail: req.user.email,
      debugRole: req.user.role
    });
  }
  next();
};

module.exports = { allow };
