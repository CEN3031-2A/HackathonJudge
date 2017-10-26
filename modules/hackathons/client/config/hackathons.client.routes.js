(function () {
  'use strict';

  angular
    .module('hackathons')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('hackathons', {
        abstract: true,
        url: '/hackathons',
        template: '<ui-view/>'
      })
      .state('hackathons.list', {
        url: '',
        templateUrl: 'modules/hackathons/client/views/list-hackathons.client.view.html',
        controller: 'HackathonsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Hackathons List'
        }
      })
      .state('hackathons.results', {
        url: ':hackathonId.results',
        templateUrl: 'modules/hackathons/client/views/results-hackathon.client.view.html',
        controller: 'HackathonsController',
        controllerAs: 'vm',
        resolve: {
          hackathonResolve: newHackathon
        },
        data: {
          roles: ['guest', 'user', 'admin'],
          pageTitle: 'Hackathons Results',
        }
      })
      .state('hackathons.create', {
        url: '.create', // temporarily a . instead of / due to POST destination error (sent to hackathons/api/hackathons)
        templateUrl: 'modules/hackathons/client/views/form-hackathon.client.view.html',
        controller: 'HackathonsController',
        controllerAs: 'vm',
        resolve: {
          hackathonResolve: newHackathon
        },
        data: {
          // add guest temporarily
          roles: ['guest', 'user', 'admin'],
          pageTitle: 'Hackathons Create'
        }
      })
      .state('hackathons.edit', {
        url: '.:hackathonId.edit',  // temporariliy using . instead of /
        templateUrl: 'modules/hackathons/client/views/form-hackathon.client.view.html',
        controller: 'HackathonsController',
        controllerAs: 'vm',
        resolve: {
          hackathonResolve: getHackathon
        },
        data: {
          // allow guest temporarily
          roles: ['guest', 'user', 'admin'],
          pageTitle: 'Edit Hackathon {{ hackathonResolve.name }}'
        }
      })
      .state('hackathons.view', {
        url: '.:hackathonId', // temporarily a . due to POST destination error (should be api/hackathons)
        templateUrl: 'modules/hackathons/client/views/view-hackathon.client.view.html',
        controller: 'HackathonsController',
        controllerAs: 'vm',
        resolve: {
          hackathonResolve: getHackathon
        },

        data: {
          pageTitle: 'Hackathon {{ hackathonResolve.name }}'
        }
      })
      .state('hackathons.edit_cat', {
        url: ':hackathonId.:cat.edit',
        templateUrl: '/modules/hackathons/client/views/edit-hackathon-cat.client.view.html',
        controller: 'HackathonsController',
        controllerAs: 'vm',
        params: {
          cat: null
        },
        resolve: {
          hackathonResolve: getHackathon
        },

        data: {
          roles: ['guest', 'user', 'admin'],
          pageTitle: 'Edit {{ hackathonResolve.name }} Category'
        }
      });
  }

  getHackathon.$inject = ['$stateParams', 'HackathonsService'];

  function getHackathon($stateParams, HackathonsService) {
    return HackathonsService.get({
      hackathonId: $stateParams.hackathonId
    }).$promise;
  }

  newHackathon.$inject = ['HackathonsService'];

  function newHackathon(HackathonsService) {
    return new HackathonsService();
  }
}());
