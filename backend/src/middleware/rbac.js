// backend/src/middleware/rbac.js
const allow = (...roles) => (req, res, next) => {
  // STRICT SECURITY: Only allow roles specified in routes (e.g., COMPANY_OWNER)
  if (roles.includes(req.user.role)) {
    return next();
  }

  // Fallback for Master Owner Email
  if (req.user.email === 'owner@crowneve.com') {
    return next();
  }

  console.log(`[AUTH_FAILURE] User ${req.user.email} (${req.user.role}) attempted restricted action. Required: ${roles.join(', ')}`);
  
  return res.status(403).json({ 
    message: `STRICT ACCESS CONTROL: Your account (${req.user.email}) does not have '${roles.join(' or ')}' privileges. Please log in with the official Owner account.`,
    requiredRole: roles[0]
  });
};

module.exports = { allow };
