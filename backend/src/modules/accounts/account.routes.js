// backend/src/modules/accounts/account.routes.js
const router = require('express').Router();
const categoryCtrl = require('./account-category.controller');
const accountCtrl = require('./account.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const allowedRoles = allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE');

// Account Category Routes
router.get('/categories', protect, allowedRoles, categoryCtrl.getAll);
router.post('/categories', protect, allowedRoles, categoryCtrl.create);
router.put('/categories/:id', protect, allowedRoles, categoryCtrl.update);
router.delete('/categories/:id', protect, allowedRoles, categoryCtrl.delete);

// Account Routes
router.get('/', protect, allowedRoles, accountCtrl.getAll);
router.post('/', protect, allowedRoles, accountCtrl.create);
router.put('/:id', protect, allowedRoles, accountCtrl.update);

module.exports = router;
