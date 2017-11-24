'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Judge = mongoose.model('Judge'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Judge
 */
exports.create = function(req, res) {
  var judge = new Judge(req.body);
  judge.user = req.user;

  judge.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(judge);
    }
  });
};

/**
 * Show the current Judge
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var judge = req.judge ? req.judge.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  judge.isCurrentUserOwner = req.user && judge.user && judge.user._id.toString() === req.user._id.toString();

  res.jsonp(judge);
};

/**
 * Update a Judge
 */
exports.update = function(req, res) {
  var judge = req.judge;

  judge = _.extend(judge, req.body);

  judge.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(judge);
    }
  });
};

/**
 * Delete an Judge
 */
exports.delete = function(req, res) {
  var judge = req.judge;

  judge.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(judge);
    }
  });
};

/**
 * List of Judges
 */
exports.list = function(req, res) {
  Judge.find().sort('-created').populate('user', 'displayName').exec(function(err, judges) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(judges);
    }
  });
};

/**
 * Judge middleware
 */
exports.judgeByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Judge is invalid'
    });
  }

  Judge.findById(id).populate('user', 'displayName').exec(function (err, judge) {
    if (err) {
      return next(err);
    } else if (!judge) {
      return res.status(404).send({
        message: 'No Judge with that identifier has been found'
      });
    }
    req.judge = judge;
    next();
  });
};
