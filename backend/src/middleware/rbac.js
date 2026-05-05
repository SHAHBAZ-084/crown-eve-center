// backend/src/middleware/rbac.js
const logger = require('../config/logger');

const allow = (...roles) => (req, res, next) => {
  // STRICT SECURITY: Only allow roles specified in routes (e.g., COMPANY_OWNER)
  if (roles.includes(req.user.role)) {
    return next();
  }

  logger.warn(`[AUTH_FAILURE] User ${req.user.email} (${req.user.role}) attempted restricted action. Required: ${roles.join(', ')}`);
  
  return res.status(403).json({ 
    message: `STRICT ACCESS CONTROL: Your account (${req.user.email}) does not have '${roles.join(' or ')}' privileges. Please log in with the official Owner account.`,
    requiredRole: roles[0]
  });
};

module.exports = { allow };
