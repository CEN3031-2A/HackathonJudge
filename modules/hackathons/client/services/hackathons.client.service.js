// Hackathons service used to communicate Hackathons REST endpoints
(function () {
  'use strict';

  angular
    .module('hackathons')
    .factory('HackathonsService', HackathonsService);

  HackathonsService.$inject = ['$resource'];

  function HackathonsService($resource) {
    return $resource('api/hackathons/:hackathonId', {
      hackathonId: '@_id'
    }, {
      update: {
        method: 'PUT', isArray:false
      }
    });
  }
}());
