// backend/src/modules/reports/report.routes.js
const router = require('express').Router();
const ctrl = require('./report.controller');
const { protect } = require('../../middleware/auth');
const { allow } = require('../../middleware/rbac');

router.get('/revenue/summary', protect, allow('BRANCH_OWNER','COMPANY_OWNER'), ctrl.getRevenueSummary);
router.get('/revenue/chart',   protect, allow('BRANCH_OWNER','COMPANY_OWNER'), ctrl.getRevenueChart);
router.get('/branches/compare', protect, allow('COMPANY_OWNER'), ctrl.compareBranches);
router.get('/branch/:id',      protect, allow('BRANCH_OWNER','COMPANY_OWNER'), ctrl.getBranch);
router.get('/sales/:id',       protect, allow('BRANCH_OWNER','COMPANY_OWNER'), ctrl.getSales);

module.exports = router;
