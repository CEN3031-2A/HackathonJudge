'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Hackathon Schema
 */
var hackathonSchema = new Schema({
  name: String,
  description: String,
  date: Date, 
  active: Boolean,
  judge: [{
    email: String,
    id: String
  }],

  category: [{
    name: String,
    description: String,

    project: [{
      name: String,
      description: String,
      link: String,

      note: [{
        text: String,
        vote: [{
          criteria_name: String,
          number: Number
        }]
      }],
    }],

    criteria: [{
      name: String,
      description: String,
      input_type: String,
      high_num: Number
    }]
  }]

});

var hackathon = mongoose.model('Hackathon', hackathonSchema);
module.exports = hackathon;
