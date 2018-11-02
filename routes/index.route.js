//@ts-check
const express = require('express');
const { recordsRouter } = require('./records.route');
const router = express.Router();

router.use('/record', recordsRouter);

module.exports = { router };
