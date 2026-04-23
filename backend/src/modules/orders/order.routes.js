// backend/src/modules/orders/order.routes.js
const router = require('express').Router();
const ctrl = require('./order.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const validate = require('../../middleware/validate');
const { createOrderSchema, updateStatusSchema } = require('./order.schema');

router.post('/',           protect, allow('EMPLOYEE','BRANCH_OWNER','CUSTOMER'), validate(createOrderSchema), ctrl.create);
router.get('/count',       protect, allow('BRANCH_OWNER','EMPLOYEE', 'COMPANY_OWNER'), ctrl.getCount);
router.get('/',            protect, allow('BRANCH_OWNER','EMPLOYEE', 'COMPANY_OWNER'), ctrl.getAll);
router.get('/customer/:id',protect, allow('CUSTOMER', 'BRANCH_OWNER'), ctrl.getByCustomer);
router.get('/:id',         protect, allow('BRANCH_OWNER','EMPLOYEE','COMPANY_OWNER'), ctrl.getById);
router.put('/:id/status',  protect, allow('EMPLOYEE','BRANCH_OWNER'),             validate(updateStatusSchema), ctrl.updateStatus);

module.exports = router;
