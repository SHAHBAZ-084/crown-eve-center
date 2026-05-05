// backend/src/modules/service-categories/service-category.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./service-category.controller');
const auth = require('../../middleware/auth');

router.get('/', auth(), controller.getAll);
router.post('/', auth(), controller.create);
router.delete('/:id', auth(), controller.remove);

module.exports = router;
