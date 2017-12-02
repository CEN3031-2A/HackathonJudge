'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Block = mongoose.model('Block'),
  Judges = mongoose.model('Judge'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Block
 */
exports.create = function(req, res) {
  var block = new Block(req.body);
  block.user = req.user;
  
  //First check if the judge ID of the vote is in database
  Judges.findOne({'id': block.data.sender}, function(error, exist) {
    if(exist && !error){
      block.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(block);
        }
      });
    } else {
      var message = {
        msg: 'Nice try. . . Better Luck Next Time!'
      }
      res.jsonp(message);
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
      // console.log('List: ' + JSON.stringify(blocks));
      res.jsonp(blocks);
    }
  });
};

/**
* Clear the blockchain
*/
exports.clear = function(req, res) {
  var result = Blocks.remove( { } );
  
};
