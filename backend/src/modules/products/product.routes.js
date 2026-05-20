// backend/src/modules/products/product.routes.js
const router = require('express').Router();
const ctrl = require('./product.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const validate = require('../../middleware/validate');
const { createProductSchema, updateProductSchema } = require('./product.schema');

router.get('/',           ctrl.getAll);
router.get('/:id',       ctrl.getById);
router.post('/',          protect, allow('BRANCH_OWNER', 'EMPLOYEE'), validate(createProductSchema), ctrl.create);
router.put('/:id',       protect, allow('BRANCH_OWNER', 'EMPLOYEE'), validate(updateProductSchema), ctrl.update);
router.delete('/:id',    protect, allow('BRANCH_OWNER', 'EMPLOYEE'), ctrl.remove);

module.exports = router;
