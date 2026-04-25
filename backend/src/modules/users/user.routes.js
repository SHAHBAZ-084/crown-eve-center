// backend/src/modules/users/user.routes.js
const router = require('express').Router();
const ctrl = require('./user.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

router.get('/',           protect, allow('COMPANY_OWNER', 'BRANCH_OWNER', 'EMPLOYEE'), ctrl.getAll);
router.post('/',          protect, allow('COMPANY_OWNER', 'BRANCH_OWNER'), ctrl.create);
router.put('/:id',       protect, allow('COMPANY_OWNER', 'BRANCH_OWNER'), ctrl.update);
router.delete('/:id',    protect, allow('COMPANY_OWNER', 'BRANCH_OWNER'), ctrl.remove);

module.exports = router;
