//@ts-check
const express = require('express');
const recordsController = require('../controllers/record.controller');

const recordsRouter = express.Router();

recordsRouter.post('/:filename', recordsController.recordStream);

module.exports = { recordsRouter };
