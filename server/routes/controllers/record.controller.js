//@ts-check
const fs = require('fs');
const path = require('path');
const { config } = require('../../config');

/**
 * @type {import('express').RequestHandler}
 */
module.exports.recordStream = (req, res) => {
  console.log(`RECORD incoming file "${req.params.filename}"`);
  const filePath = path.join(config.filesPath, req.params.filename);
  const fileStream = fs.createWriteStream(filePath);
  req.pipe(fileStream);
  req.on('end', () => {
    res.status(200).end();
  });
};
