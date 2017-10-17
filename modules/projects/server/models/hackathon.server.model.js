'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  /*
  When admin creates a new hackathon, an empty hackathon entity will be created.
  Hackathon will contain the IDs of projects associated with the hackathon
  */
var HackathonSchema = new Schema ({
  // Automatic MongoDB PK is generated - string
  // it will be referenced as hackathon_id in other entities
  name: {
    type: String,
    required: true,
    unique: true
  },

  // Admin can describe the hackathon (e.g. where it takes place, time span)
  description: {
    type: String
  },
  category_id: [{
    type:  String
  }]
});
var hackathon = mongoose.model('Hackathon', HackathonSchema);
module.exports = hackathon;
