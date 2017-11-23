(function() {
'use strict';
    
	angular.module("hackathons").controller("ViewVotesController", ViewVotesController);

  ViewVotesController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve'];
    
  function ViewVotesController($scope, $stateParams, $state, $window, Authentication, hackathon) {
		var vm = this;
		vm.authentication = Authentication;
		vm.hackathon = hackathon;
		
  }
}());
    