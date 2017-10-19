'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/* Scoring criteria */
var CriteriaSchema = new Schema ({
  //Automatic MongoDB PK is generated - String

  name: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String
  },

  // Custom or range input
  input_type: {
    type: String,
    required: true
  },

  // There is no low_num for the range because it will be automatically be zero
  // It is assumed that the ratings would not allow negative input (maybe should ask Joseph about it?)

  high_num: {
    type: Number
  }
});

var criteria = mongoose.model('Criteria', CriteriaSchema);
module.exports = criteria;
