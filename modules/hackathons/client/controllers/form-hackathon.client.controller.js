(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('CreationController', CreationController)

  CreationController.$inject = ['$scope', '$stateParams', '$state',
    '$window', 'Authentication', 'hackathonResolve', '$http', 'HackathonsService'];


  function CreationController($scope, $stateParams, $state, $window, Authentication, hackathon, $http, HackathonsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.hackathon.date = new Date(vm.hackathon.date);
    vm.error = null;
    vm.form = {};
    vm.save = save;
    vm.create = create;
    vm.duplicate = duplicate;

    // Instead of creating a new hackathon from scratch, duplicate the latest hackathon (minus the results, ID, array of judges, projects)
    function duplicate() {
      HackathonsService.query().$promise.then(function (results) {
        var latest_hackathon = undefined;

        // Find the latest hackathon
        angular.forEach(results, function (result) {
          if (latest_hackathon == undefined)
            latest_hackathon = result;
          
          else if (result.date > latest_hackathon.date || latest_hackathon.date == undefined)
            latest_hackathon = result;
        });

        vm.hackathon = latest_hackathon;
        vm.hackathon.description = "Hackathon duplicated from: " + vm.hackathon.name;
        vm.hackathon.name = "Duplicated - " + vm.hackathon.name;  // Make sure there are no duplicate names in the database
        
        vm.hackathon._id = undefined;   // Make sure that there are no duplicate IDs in the database
        vm.hackathon.active = false;

        // Shift the date of the hackathon forward one year
        let temp_date = latest_hackathon.date;
        temp_date = new Date(temp_date);
        let month = temp_date.getMonth();
        let year = temp_date.getFullYear();
        let day = temp_date.getDay();
        vm.hackathon.date = new Date (year+1, month, day);
        
        vm.hackathon.judge = undefined;

        // Remove projects from the duplicated hackathon
        for (let i = 0; i < vm.hackathon.category.length; i++) {
          vm.hackathon.category[i].project = undefined;
        }
        save(true);
      });
    }

    // Create new Hackathon
    function create() {
      vm.hackathon = new Hackathon();
    }

    // Save Hackathon
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.hackathonForm');
        return false;
      }

      if (vm.hackathon.active != true)
        vm.hackathon.active = false;

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
