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
  console.log('New Block: ' + JSON.stringify(block));
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
      console.log('List: ' + JSON.stringify(blocks));
      res.jsonp(blocks);
    }
  });
};
