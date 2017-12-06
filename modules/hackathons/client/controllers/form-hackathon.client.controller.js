(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('CreationController', CreationController)

  CreationController.$inject = ['$scope', '$stateParams', '$state',
    '$window', 'Authentication', 'hackathonResolve', '$http', 'HackathonsService', 'JudgesService'];


  function CreationController($scope, $stateParams, $state, $window, 
    Authentication, hackathon, $http, HackathonsService, JudgesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.hackathon.date = new Date(vm.hackathon.date);
    vm.error = null;
    vm.form = {};
    vm.save = save;
    vm.create = create;
    vm.duplicate = duplicate;

    // Hold the database's information about the hackathon's active status
    // temp_active holds DB info. vm.hackathon.active holds DB info and is modified by the user
    // temp_active is to show different options on the new/edit hackathon screen
    vm.temp_active = vm.hackathon.active;
    
    if (vm.temp_active == undefined || vm.temp_active == null)
      vm.temp_active = false; // Instantiate as false if creating a new hackathon 


    // Get hackathons to check see if there are multiple hackathons
    var hackathons = HackathonsService.query();

    // Get the judge collection in case the admin wants to deactivate a hackathon
    vm.judges = JudgesService.query();

    // Instead of creating a new hackathon from scratch, duplicate the latest hackathon 
    // (minus the results, ID, array of judges, projects)
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

        // Shift the date of the hackathon forward one year (for visibility purposes - it can be manually changed by admin)
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

      // If this hackathon is active, make sure no other hackathons are active (only allow one active hackathon at a time)
      if (vm.hackathon.active == true) {
        for (let i=0; i < hackathons.length; i++) {
          // If the another hackathon is active and it isn't this hackathon, don't set this hackathon to be active
          if (hackathons[i].active == true && vm.hackathon._id != hackathons[i]._id) {
            alert("Another hackathon is already active!");
            return;
          }
        }
      }

      if (vm.hackathon.active != true) {

        // If the admin is deactivating a hackathon, make sure the admin truly wants to do it
        if (vm.hackathon.judge != undefined) {
          if (vm.hackathon.judge.length != 0) {
            if (!$window.confirm("Are you sure you sure you want to deactivate this hackathon? All associated hackathon judges will be deleted."))
              return;
          }
        }
        vm.hackathon.active = false;

        // Clear out the judges (if any) -- this occurs when a hackathon is completed and set to inactive
        if (vm.hackathon.judge != undefined) {
          let to_delete = []; // Store the judges to delete

          // Get the judges that belong to the current hackathon to delete
          // Ideally since there should be only one active hackathon at a time, all the judges
          // from the judge collection will be deleted
          for (let i=0; i < vm.hackathon.judge.length; i++) {
            for (let j=0; j < vm.judges.length; j++) {
              if (vm.hackathon.judge[i].id == vm.judges[j].id) {
                to_delete.push(vm.judges[j]._id); // Store the MongoDB ID
                break;
              }
            }
          }

          // Delete the judges
          vm.hackathon.judge = [];
          for (let i=0; i < to_delete.length; i++) {
            let url = "/api/judges/";
            url += to_delete[i];
            $http({method: 'DELETE', url: url}).then(function(res) {
              console.log("Deleted");
            }, function(err) {
              console.log("Fail");
            });
          }
        }
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
