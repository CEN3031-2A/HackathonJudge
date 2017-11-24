(function () {
  'use strict';

  angular
    .module('hackathons')
    .controller('ProjectsListController', ProjectsListController);

  ProjectsListController.$inject = ['ProjectsService', '$stateParams',
    '$state', 'Socket', '$scope', 'BlockService', '$http', '$window', 'JudgesService'];

  function ProjectsListController(ProjectsService, $stateParams,
    $state, Socket, $scope, BlockService, $http, $window, JudgesService) {
    var vm = this;

    $scope.contains;

    var indexOfJudge; // Store index of judge for array vm.hackathon.judge

    var new_judge;
    JudgesService.query().$promise.then(function (results) {
      angular.forEach(results, function (result) {
        if (result.id == $stateParams.judgeID) {
          new_judge = result;
          console.log(new_judge);
        }
      });
    });

    function updateJudge(project) {
      new_judge.vote.append(project);
      let url = "/api/judges/"
      url += new_judge._id;

      $http({ method: 'PUT', url: url }).then(function (res) {
        console.log("Updated");
      }, function (err) {
        console.log("Fail");
      });
    };

    // Get hackathons (HTML will only display projects from active hackathon )
    ProjectsService.query().$promise.then(function (results) {

      // Need to check to see if the judge ID is valid (in the database)
      // If invalid, send user to forbidden page
      angular.forEach(results, function (result) {

        // Look for the active hackathon
        if (result.active == true) {
          vm.hackathon = result;
          let judges = result.judge;
          let i = 0;

          // Check to see if the ID is in the DB
          // Continue iterating through the IDs if the current ID is invalid
          while (i < judges.length && judges[i].id != $stateParams.judgeID) {
            // Reached the end and the given ID is invalid - redirect to forbidden
            if (i == judges.length - 1)
              $state.go('forbidden');
            i++;
          }

          // Store index of judge for array vm.hackathon.judge
          for (let i = 0; i < vm.hackathon.judge.length; i++) {
            if (vm.hackathon.judge[i].id == $stateParams.judgeID) {
              indexOfJudge = i;

              $scope.contains = function (project_name) {
                for (let i = 0; i < vm.hackathon.judge[indexOfJudge].vote.length; i++) {
                  if (vm.hackathon.judge[indexOfJudge].vote[i] == project_name)
                    return true;
                }
                return false;
              }

              break;
            }
          }
        }
      });
      //vm.hackathons = results;
    });

    vm.blockchain = [];
    vm.saveVote = saveVote;

    vm.scaleArray = [
      ['1'],
      ['1', '2'],
      ['1', '2', '3'],
      ['1', '2', '3', '4'],
      ['1', '2', '3', '4', '5'],
      ['1', '2', '3', '4', '5', '6'],
      ['1', '2', '3', '4', '5', '6', '7'],
      ['1', '2', '3', '4', '5', '6', '7', '8'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
    ];

    // Create a controller method for sending messages
    function saveVote(project, category) {

      // Update the hackathon in case anyone else has voted
      let url = "/api/hackathons/";
      url += vm.hackathon._id;

      $http({ method: 'GET', url: url }).then(function (res) {
        vm.hackathon = res.data;

        
        // Make sure that the user wants to finalize his/her vote
        if (!$window.confirm("Are you sure you want to vote? All votes are final and cannot be edited."))
          return;

        // Check to see if the judge has already voted for a project (ideally an alert should not a appear because it is already check beforehand)
        for (let j = 0; j < vm.hackathon.judge[indexOfJudge].vote.length; j++) {
          //Check to see if any of the judge's votes correspond to the current vote
          if (vm.hackathon.judge[indexOfJudge].vote[j] == project.name) {
            alert("You have already voted for this project! Cannot vote again!");
            return;
          }
        }


        // Make sure that the judge has filled in values for all criteria
        for (let i = 0; i < category.criteria.length; i++) {
          if (project.tempVote[i] == undefined) {
            alert("Please fill in all criteria.");
            return;
          }
        }

        // Append project name to the vote array to remember that the judge has already voted for a project
        vm.hackathon.judge[indexOfJudge].vote.push(project.name);

        $http.put(url, vm.hackathon)
          .then(
          function (response) {
            // success callback
            vm.hackathon = response.data;
          },
          function (response) {
            // failure callback
          }
          );

        var votes = [];
        for (var i = 0; i < category.criteria.length; i++) {
          votes[i] = { criteria: category.criteria[i].name, value: project.tempVote[i] };
        }
        // Create a new message object
        var data = {
          sender: $stateParams.judgeID,
          recipient: project.name,
          category: category.name,
          note: project.note,
          vote: votes
        };

        BlockService.add(data);
      }, function (err) {
        console.log("Error");
      });
    }


  }

}());
