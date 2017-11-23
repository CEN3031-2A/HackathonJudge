// Hackathons service used to communicate Hackathons REST endpoints
(function () {
    'use strict';

    angular
      .module('hackathons')
      .factory('ProjectsService', ProjectsService);

    ProjectsService.$inject = ['$resource'];

    function ProjectsService($resource) {
      return $resource('api/hackathons', {}, {
        query: {
          method: 'GET', isArray:true
        }
      });
    }
  }());
