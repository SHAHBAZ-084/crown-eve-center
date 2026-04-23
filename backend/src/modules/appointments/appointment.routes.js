// backend/src/modules/appointments/appointment.routes.js
const router = require('express').Router();
const ctrl = require('./appointment.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

const validate = require('../../middleware/validate');
const { createAppointmentSchema, updateAppointmentStatusSchema } = require('./appointment.schema');

router.get('/today',      protect, allow('BRANCH_OWNER', 'EMPLOYEE', 'TECHNICIAN'), ctrl.getToday);
router.get('/',           protect, allow('BRANCH_OWNER', 'EMPLOYEE', 'COMPANY_OWNER', 'TECHNICIAN'), ctrl.getAll);
router.get('/my',        protect, allow('CUSTOMER'), ctrl.getMine);
router.post('/',          protect, allow('CUSTOMER'), validate(createAppointmentSchema), ctrl.create);
router.put('/:id',       protect, allow('BRANCH_OWNER', 'EMPLOYEE', 'TECHNICIAN'), validate(updateAppointmentStatusSchema), ctrl.updateStatus);

module.exports = router;
