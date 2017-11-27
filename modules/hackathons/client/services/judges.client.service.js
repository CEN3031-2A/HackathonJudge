// Judges service used to communicate Judges REST endpoints
(function () {
  'use strict';

  angular
    .module('hackathons')
    .factory('JudgesService', JudgesService);

  JudgesService.$inject = ['$resource'];

  function JudgesService($resource) {
    return $resource('api/judges/:judgeId', {
      judgeId: '@_id'
    }, {
        update: {
          method: 'PUT'
        }
      });
  }
}());
