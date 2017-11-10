(function () {
    'use strict';

    angular
      .module('hackathons')
      .controller('ProjectsListController', ProjectsListController);

    ProjectsListController.$inject = ['ProjectsService', 'Socket'];

    function ProjectsListController(ProjectsService, Socket) {
      var vm = this;

      vm.hackathons = ProjectsService.query();

      vm.blockchain = [];
      vm.voteValues = [];
      // vm.CurrentProject = null;
      // vm.sendVote = sendVote;
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

  // function saveVote() {
    // vm.blockchain.push(project.tempVote);
  // }

      // init();
      //
      // function init() {
      //   // Make sure the Socket is connected
      //   if (!Socket.socket) {
      //     Socket.connect();
      //   }
      //
      //   // Add an event listener to the 'chatMessage' event
      //   Socket.on('voteMessage', function (newBlock) {
      //     vm.blockchain.push(newBlock);
      //   });
      //
      //   // Remove the event listener when the controller instance is destroyed
      //   $scope.$on('$destroy', function () {
      //     Socket.removeListener('voteMessage');
      //   });
      // }

      // Create a controller method for sending messages
      function saveVote(projectName) {
        // Create a new message object
        var data = {
          sender: 2,
          recipient: projectName,
          voteCriteria1: vm.tempVote[0],
          voteCriteria2: vm.tempVote[1],
          voteCriteria3: vm.tempVote[2],
          voteCriteria4: vm.tempVote[3]
        };

        console.log(data);
        // Emit a 'voteMessage' message event
        Socket.emit('voteMessage', data);

        // Clear the message text
        // vm.voteValues = [];
      }

    }
}());
