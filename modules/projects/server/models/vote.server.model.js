'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/* Votes */
var VoteSchema = new Schema ({
  // Automatic MongoDB PK is generated - String

  project_id: {
    type: String,
    required: true
  },

  rating: [{
    criteria_id: {
      type: String,
      required: true
    },

    value: {
      type: Number,
      required: true
    }
  }]
});

var vote = mongoose.model('Vote', VoteSchema);
module.exports = vote;
