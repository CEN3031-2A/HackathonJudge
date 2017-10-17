'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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

var note = mongoose.model('Note', NoteSchema);
module.exports = note;
