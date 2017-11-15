'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var blockSchema = new Schema({
  index: {type: Number, require: true},
  previousHash: {type: String, require: true},
  timestamp: {type: Number, require: true},
  data: {
    sender: String,
    category: String,
    recipient: String,
    note: String,
    vote: [{criteria: String, value: Number}]
  }
});

var block = mongoose.model('Block', blockSchema);
module.exports = block;
