const { existsSync, readdirSync } = require('fs');

exports.getFolders = function getFolders(dir) {
  return readdirSync(dir);
};

exports.hasFolder = function hasFolder(dir) {
  return existsSync(dir);
};
