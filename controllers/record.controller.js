//@ts-check
const express = require('express'); // eslint-disable-line

const fs = require('fs');
const path = require('path');
const config = require('../lib/config.lib');

/**
 * @type {express.RequestHandler}
 */
module.exports.recordStream = (req, res) => {
  console.log(`RECORD incoming file "${req.params.filename}"`);
  const filePath = path.join(config.get('filesFullPath'), req.params.filename);
  const fileStream = fs.createWriteStream(filePath);
  req.pipe(fileStream);
  req.on('end', () => {
    res.status(200).end();
  });
};
