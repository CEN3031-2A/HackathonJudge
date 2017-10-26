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

// Need to link the person's notes with their votes?
var NoteSchema = new Schema ({
  // Automatic MongoDB PK is generated - string

  vote_id: {
    type: String,
    required: true
  },

  text: {
    type: String
  }
});

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

/* Only keeping this schema so the app works */
var project = mongoose.model('Project', ProjectSchema);

module.exports = project;
