'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var judgeSchema = new Schema({
  email: String,
  id: String,
  vote: [String]
});

var judge = mongoose.model('Judge', judgeSchema);
module.exports = judge;
