'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Hackathon = mongoose.model('Hackathon'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Hackathon
 */
exports.create = function(req, res) {
  var hackathon = new Hackathon(req.body);
  hackathon.user = req.user;

  hackathon.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hackathon);
    }
  });
};

/**
 * Show the current Hackathon
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var hackathon = req.hackathon ? req.hackathon.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  hackathon.isCurrentUserOwner = req.user && hackathon.user && hackathon.user._id.toString() === req.user._id.toString();

  res.jsonp(hackathon);
};

/**
 * Update a Hackathon
 */
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
};

/**
 * Delete an Hackathon
 */
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
};

/**
 * List of Hackathons
 */
exports.list = function(req, res) {
  Hackathon.find().sort('-created').populate('user', 'displayName').exec(function(err, hackathons) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(hackathons);
    }
  });
};

/**
 * Hackathon middleware
 */
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
};
