// backend/src/modules/vouchers/voucher.routes.js
const router = require('express').Router();
const ctrl = require('./voucher.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const allowedRoles = allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE');

router.get('/', protect, allowedRoles, ctrl.getAll);
router.get('/next-no', protect, allowedRoles, ctrl.getNextNo);
router.post('/', protect, allowedRoles, ctrl.create);
router.delete('/:id', protect, allowedRoles, ctrl.deleteVoucher);

module.exports = router;
