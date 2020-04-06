const uuid = require('uuid');

exports.getId = function getId() {
  return uuid();
};
