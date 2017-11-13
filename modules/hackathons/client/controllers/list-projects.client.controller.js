(function () {
    'use strict';

    angular
      .module('hackathons')
      .controller('ProjectsListController', ProjectsListController);

    ProjectsListController.$inject = ['ProjectsService', 'Socket', '$scope', 'BlockService'];

    function ProjectsListController(ProjectsService, Socket, $scope, BlockService) {
      var vm = this;

      vm.hackathons = ProjectsService.query();

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

      init();

      function init() {
        // Make sure the Socket is connected
        if (!Socket.socket) {
          Socket.connect();
        }

        // Add an event listener to the 'chatMessage' event
        Socket.on('voteMessage', function (newBlock) {
          if(newBlock.type == 'vote')
          {
            vm.blockchain.push(newBlock);
          }
        });

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function () {
          Socket.removeListener('voteMessage');
        });
      }

      // Create a controller method for sending messages
      function saveVote(project, category) {
        // Create a new message object
        var data = {
          sender: 2,
          recipient: project.name,
          category: category.name,
          voteCriteria1: project.tempVote[0],
          voteCriteria2: project.tempVote[1],
          voteCriteria3: project.tempVote[2],
          voteCriteria4: project.tempVote[3]
        };

        // console.log(data);
        var newBlock = BlockService.add(data);

        // Emit a 'voteMessage' message event
        Socket.emit('voteMessage', newBlock);

        // Clear the message text?
      }

    }
}());
