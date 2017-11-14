'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Block = mongoose.model('Block'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Block
 */
exports.create = function(req, res) {
  var block = new Block(req.body);
  block.user = req.user;

  block.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(block);
    }
  });
};

/**
 * List of Blocks
 */
exports.list = function(req, res) {
  Block.find().sort('-created').populate('user', 'displayName').exec(function(err, blocks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(blocks);
    }
  });
};


/**
 * Show the current Hackathon
 
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var hackathon = req.hackathon ? req.hackathon.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  hackathon.isCurrentUserOwner = req.user && hackathon.user && hackathon.user._id.toString() === req.user._id.toString();

  res.jsonp(hackathon);
}; */

/**
 * Update a Hackathon
 
exports.update = function(req, res) {
  var hackathon = req.hackathon;

  hackathon = _.extend(hackathon, req.body);

  hackathon.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hackathon);
    }
  }); 
}; */

/**
 * Delete an Hackathon
 
exports.delete = function(req, res) {
  var hackathon = req.hackathon;

  hackathon.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hackathon);
    }
  });
}; */


/**
 * Hackathon middleware
 
exports.hackathonByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Hackathon is invalid'
    });
  }

  Hackathon.findById(id).populate('user', 'displayName').exec(function (err, hackathon) {
    if (err) {
      return next(err);
    } else if (!hackathon) {
      return res.status(404).send({
        message: 'No Hackathon with that identifier has been found'
      });
    }
    req.hackathon = hackathon;
    next();
  });
}; */
