'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  hackathon_id: {
    type: String,
    required: true
  },

  // This will match the _id of the corresponding category entity
  // This will become redundant upon consolidation within hackathon
  category_id: {
    type: String,
    required: true
  },

  // If the project has no description (for whatever reason), just have description be N/A
  description: {
    type: String,
    required: true,
    default: 'N/A'
  },

  link : {
    type: String,
    required: true
  }}, {
    collection: 'projects'
});

var project = mongoose.model('Project', ProjectSchema);
module.exports = project;
