const router = require('express').Router();
const ctrl = require('./bank.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

router.get('/', protect, allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE'), ctrl.getAll);
router.post('/', protect, allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE'), ctrl.create);

module.exports = router;
