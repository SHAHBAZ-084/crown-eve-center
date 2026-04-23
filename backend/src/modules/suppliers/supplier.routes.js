// backend/src/modules/suppliers/supplier.routes.js
const router = require('express').Router();
const ctrl = require('./supplier.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

router.get('/', protect, allow('BRANCH_OWNER'), ctrl.getAll);
router.post('/', protect, allow('BRANCH_OWNER'), ctrl.create);

module.exports = router;
