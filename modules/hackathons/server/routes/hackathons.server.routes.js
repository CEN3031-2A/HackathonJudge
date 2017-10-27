'use strict';

/**
 * Module dependencies
 */
var hackathonsPolicy = require('../policies/hackathons.server.policy'),
  hackathons = require('../controllers/hackathons.server.controller');

module.exports = function(app) {
  // Hackathons Routes
  app.route('/api/hackathons').all(hackathonsPolicy.isAllowed)
    .get(hackathons.list)
    .post(hackathons.create);

  app.route('/api/hackathons/:hackathonId').all(hackathonsPolicy.isAllowed)
    .get(hackathons.read)
    .put(hackathons.update)
    .delete(hackathons.delete);

  // Finish by binding the Hackathon middleware
  app.param('hackathonId', hackathons.hackathonByID);
};
