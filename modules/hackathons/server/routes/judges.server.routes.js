'use strict';

/**
 * Module dependencies
 */
var judgesPolicy = require('../policies/judges.server.policy'),
  judges = require('../controllers/judges.server.controller');

module.exports = function(app) {
  // Judges Routes
  app.route('/api/judges').all(judgesPolicy.isAllowed)
    .get(judges.list)
    .post(judges.create);

  app.route('/api/judges/:judgeId').all(judgesPolicy.isAllowed)
    .get(judges.read)
    .put(judges.update)
    .delete(judges.delete);

  // Finish by binding the Judge middleware
  app.param('judgeId', judges.judgeByID);
};
