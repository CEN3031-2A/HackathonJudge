'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/* Categories */
var CategorySchema = new Schema ({
  //Automatic MongoDB PK is generated - String

  name: {
    type: String,
    required: true,
    unique: true
  },

  // Note: Slight problem. When Joseph changes criteria for a category (because he has one dynamic
  // criteria), this will affect past criteria.
  // e.g. Project in 2016 was scored in IoT criteria, but in 2017 when the criteria changes to AI,
  // it will look like the project was scored on AI criteria
  // FK
  criteria_id: [{
    type: String
  }],

  // Optional description about the category
  description: {
    type: String
  }
});

var category = mongoose.model('Category', CategorySchema);
module.exports = category;
