// backend/src/modules/vouchers/voucher.routes.js
const router = require('express').Router();
const ctrl = require('./voucher.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const allowedRoles = allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE');

router.get('/', protect, allowedRoles, ctrl.getAll);
router.post('/', protect, allowedRoles, ctrl.create);

module.exports = router;
