/* Import mongoose and define any variables needed to create the schema */
var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;


/* Projects */
var projectSchema = new Schema({
  // Automatic MongoDB PK is generated - string _id

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
    required: true
  },

  link : {
    type: String,
    required: true
  }
});

/* Categories */
var categorySchema = new Schema ({
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
var criteriaSchema = new Schema ({
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
var voteSchema = new Schema ({
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
var noteSchema = new Schema ({
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
var hackathonSchema = new Schema ({ 
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



/* Use your schema to instantiate a Mongoose model */
var project = mongoose.model('Project', projectSchema);
var category = mongoose.model('Category', categorySchema);
var criteria = mongoose.model('Criteria', criteriaSchema);
var vote = mongoose.model('Vote', voteSchema);
var hackathon = mongoose.model('Hackathon', hackathonSchema);
var note = mongoose.model('Note' noteSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = project;
module.exports = category;
module.exports = criteria;
module.exports = vote;
module.exports = hackathon;
module.exports = note;