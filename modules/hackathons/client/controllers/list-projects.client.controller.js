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

    // Function that checks if the judge has already voted for a project (defined later)
    $scope.contains;

    var curr_judge;   // Store the Judge object of the current judge

    // Get the entry of the current judge
    JudgesService.query().$promise.then(function (results) {
      angular.forEach(results, function (result) {
        if (result.id == $stateParams.judgeID) {
          curr_judge = result;

          // Check to see if a judge has already voted for a project - return true if yes
          $scope.contains = function (project_name) {
            for (let i = 0; i < curr_judge.vote.length; i++) {
              if (curr_judge.vote[i] == project_name)
                return true;
            }
            return false;
          }
        }
      });

      // Get hackathons and find the active hackathon (HTML will only display projects from active hackathon)
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
          }
        });
      });
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
      // Make sure that the user wants to finalize his/her vote
      if (!$window.confirm("Are you sure you want to vote? All votes are final and cannot be edited."))
        return;

      // Check to see if the judge has already voted for a project (ideally an alert should not a appear because it is already check beforehand)
      for (let j = 0; j < curr_judge.vote.length; j++) {
        //Check to see if any of the judge's votes correspond to the current vote
        if (curr_judge.vote[j] == project.name) {
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

      // Remember that a judge has already voted for a project
      curr_judge.vote.push(project.name);
      let new_url = "/api/judges/"
      new_url += curr_judge._id;

      $http({ method: 'PUT', url: new_url, data: curr_judge }).then(function (res) {
        console.log("Updated");
        curr_judge.__v += 1;
      }, function (err) {
        console.log("Fail");
        console.log(err);
      });


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
    }


  }

}());
