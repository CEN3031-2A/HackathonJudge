(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('HackathonsController', HackathonsController);

  HackathonsController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve'];

  function HackathonsController ($scope, $stateParams, $state, $window, Authentication, hackathon) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    if ($stateParams.cat != null) {
      vm.catToUpdate = hackathon.category[$stateParams.cat];
      vm.cat = $stateParams.cat;
    }

    // Remove existing Hackathon
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.hackathon.$remove($state.go('hackathons.list'));
      }
    }

    // Save Hackathon
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.hackathonForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.hackathon._id) {
        vm.hackathon.$update(successCallback, errorCallback);
      } else {
        vm.hackathon.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('hackathons.view', {
          hackathonId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
