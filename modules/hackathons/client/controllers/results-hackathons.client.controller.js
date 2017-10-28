(function() {
'use strict';


angular.module("hackathons").controller("ResultsController", ResultsController);

ResultsController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve'];

function ResultsController($scope, $stateParams, $state, $window, Authentication, hackathon) {
  var vm = this;
  vm.authentication = Authentication;
  vm.hackathon = hackathon;

  vm.vote_sizes = []; // Hold the number of votes per projects
  vm.projects = vm.hackathon.category[0].project; // Hold projects - temporarily the first category projects only

  // Graph variables
  $scope.labels = [];
  $scope.series = [];
  $scope.data = [];
  $scope.options = {legend: {display: true}};

  
  // Inside for loop to iterate across all categories - begin
  // numbers are 0 temporarily until iteration is made

  var criteria = vm.hackathon.category[0].criteria;
  
  for (var i=0; i < vm.projects.length; i++) {
    $scope.labels.push(vm.projects[i].name);
  }

  for(var i=0; i < criteria.length; i++) {
    $scope.series.push(criteria[i].name);
    
    // Push empty arrays to hold the votes later
    $scope.data.push([]);
  }

  // Inside for loop to iterate across all projects and their notes
  for (var curr_project=0; curr_project < vm.projects.length; curr_project++) {
    var notes = vm.projects[curr_project].note;

    // Inside for loop to iterate across all the votes corresponding to each criteria
    // Sum up all the votes for a given criteria of one project and then move to the next criteria until the end
    for (var curr_criteria=0; curr_criteria < criteria.length; curr_criteria++) {
      var vote_sum = 0;

      // assumption - all votes corresponding to the same criteria have the same index in each array
      for (var curr_note=0; curr_note < notes.length; curr_note++) {
        vote_sum += notes[curr_note].vote[curr_criteria].number;
      }

      // Push the average of the votes to the data
      if (notes.length != 0)
        vote_sum = vote_sum / notes.length;

      //console.log(vote_sum);
      $scope.data[curr_criteria].push(vote_sum);
    }

    vm.vote_sizes.push(notes.length);
    //console.log($scope.data);
  }

  

  // Sample data for reference
  /*
  $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.series = ['Series A', 'Series B'];
  
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];*/
  }
}());
