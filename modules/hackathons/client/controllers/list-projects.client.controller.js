(function () {
    'use strict';

    angular
      .module('hackathons')
      .controller('ProjectsListController', ProjectsListController);


    ProjectsListController.$inject = ['ProjectsService', '$stateParams', '$state', 'Socket', '$scope', 'BlockService'];

    function ProjectsListController(ProjectsService, $stateParams, $state, Socket, $scope, BlockService) {

      var vm = this;

      // Get hackathons (HTML will only display projects from active hackathon )
      ProjectsService.query().$promise.then(function (results) {

        // Need to check to see if the judge ID is valid (in the database)
        // If invalid, send user to forbidden page
        angular.forEach(results, function(result) {

          // Look for the active hackathon
          if (result.active == true) {
            let judges = result.judge;
            let i=0;

            // Check to see if the ID is in the DB
            // Continue iterating through the IDs if the current ID is invalid
            while (i < judges.length && judges[i].id != $stateParams.judgeID) {
              // Reached the end and the given ID is invalid - redirect to not-found
              if (i == judges.length - 1)
                $state.go('forbidden');
              i++;
            }
          }
        });
        vm.hackathons = results;
      });

      vm.blockchain = [];
      vm.saveVote = saveVote;

      vm.scaleArray = [
        ['1'],
        ['1','2'],
        ['1','2','3'],
        ['1','2','3', '4'],
        ['1','2','3', '4', '5'],
        ['1','2','3', '4', '5', '6'],
        ['1','2','3', '4', '5', '6', '7'],
        ['1','2','3', '4', '5', '6', '7', '8'],
        ['1','2','3', '4', '5', '6', '7', '8', '9'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10', '11'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
        ['1','2','3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']
      ];

      // Create a controller method for sending messages
      function saveVote(project, category) {
        var votes = [];
        for(var i = 0; i < category.criteria.length; i++)
        {
          votes[i] = {criteria: category.criteria[i].name, value: project.tempVote[i]};
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
