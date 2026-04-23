// backend/src/modules/inventory/inventory.routes.js
const router = require('express').Router();
const ctrl = require('./inventory.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

router.get('/alerts',    protect, allow('BRANCH_OWNER', 'COMPANY_OWNER', 'EMPLOYEE'), ctrl.getAlerts);
router.get('/',          protect, allow('BRANCH_OWNER', 'EMPLOYEE', 'COMPANY_OWNER'), ctrl.getAll);
router.put('/:id',       protect, allow('BRANCH_OWNER'), ctrl.update);

module.exports = router;
