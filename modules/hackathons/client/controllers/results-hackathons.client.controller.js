(function () {
  'use strict';


  angular.module("hackathons").controller("ResultsController", ResultsController);

  ResultsController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve', 'Socket', 'BlockService'];

  function ResultsController($scope, $stateParams, $state, $window, Authentication, hackathon, Socket, BlockService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.hackathon = hackathon;

    // Check to see if the given index is the index of the category that has the overall winner
    $scope.isSecondary = function (index) {
      if (index == vm.overall_winner_index)
        return true;
      else
        return false;
    }

    // Prepare to store winners
    // Category winners are projects with the most points in the category. Overall winner is most points overall
    // For the category with the overall winner, the winner of that category becomes the project with the next most points
    vm.winners = [];                // Hold winners of each category
    vm.winner_votes = [];           // Hold scores (accumulation of all vote values) of each winner
    vm.secondary_winners = [];      // Hold projects with the second most points for each category
    vm.secondary_winner_votes = []; // Hold scores of each winner

    vm.overall_winner = "None";
    vm.overall_winner_vote = 0;
    vm.overall_winner_index = 0;

    // Instantiate values into the array to access and compare when trying to find winners
    for (let i = 0; i < vm.hackathon.category.length; i++) {
      vm.winners.push("None");
      vm.winner_votes.push(0);
      vm.secondary_winners.push("None");
      vm.secondary_winner_votes.push(0);
    }

    vm.vote_count = []; // Hold number of votes of each project (2D array - vm.vote_count[category][project])


    for (let i = 0; i < vm.hackathon.category.length; i++) {
      // Need to form a 2D array for vm.vote_count, so we need to push 1D arrays into it 
      let temp_array = [];
      for (let j = 0; j < vm.hackathon.category[i].project.length; j++) {
        temp_array.push(0);
      }
      vm.vote_count.push(temp_array);
    }

    // Bars for graph are displayed horizontally

    // Graph variables
    $scope.labels = [];   // 2D array that holds y-axis labels for each graph -- e.g. $scope.labels[0] accesses labels for category 0
    $scope.series = [];   // 3D array that holds how many bars there will be per label (i.e. criteria) -- e.g. $scope.series[0] accesses criteria for category 0
    $scope.data = [];     // 3D array that holds data points for each graph -- e.g. $scope.data[0] accesses data points for category 0
    $scope.options = [];  // 1D array that holds how each graph will be structured - only part that changes per option is the title

    // Variables accessed by the results view
    vm.projects = [];   // 2D array which will hold the projects -- e.g. vm.projects[0] contains projects corresponding to category 0

    //var total_scores = [];  // 2D array to hold the cumulative score of each project
    vm.blockchain = [];     // Hold blockchain (votes for an active hackathon)


    // Iterate over the categories to extract information for above variables (end-goal: find winners)
    for (var cat = 0; cat < vm.hackathon.category.length; cat++) {
      // Variables which will be pushed into the respective $scope variables (series and data will be 2D arrays, labels is 1D, options is an object)
      var labels = [];  // 1D array
      var series = [];  // 2D array
      var data = [];    // 2D array

      //total_scores.push([]);

      // Set how each graph will be displayed
      var options = {
        legend: {
          display: true
        },

        title: {
          display: true,
          text: vm.hackathon.category[cat].name + " - Results",
          fontSize: 20,
          fontColor: '#509e2f'
        },

        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }],
          xAxes: [{
            ticks: {
              min: 0
            }
          }]
        },


        responsive: false,
        maintainAspectRatio: false
      };

      $scope.options.push(options);

      var projects = vm.hackathon.category[cat].project;  // Holds projects of given category
      var criteria = vm.hackathon.category[cat].criteria; // Holds criteria of given category

      // Push project names into labels
      for (var i = 0; i < projects.length; i++) {
        labels.push(projects[i].name);
      }

      $scope.labels.push(labels); // Push 1D array of labels into $scope.labels (forming 2D array)

      // Push criteria into series
      for (var i = 0; i < criteria.length; i++) {
        series.push(criteria[i].name);

        data.push([]);  // Push empty arrays to hold the votes later
      }

      $scope.series.push(series); // Push 1D array of series into $scope.series (forming 2D array)


      // Inside for loop to iterate across all projects
      for (var curr_project = 0; curr_project < projects.length; curr_project++) {
        var notes = projects[curr_project].note;  // Store notes (and their associated votes as well)

        let proj_score = 0; // Store total score of the project

        // Loop to iterate across all the votes corresponding to each criteria
        // Sum up all the votes for a given criteria of one project and then move to the next criteria until the end
        for (var curr_criteria = 0; curr_criteria < criteria.length; curr_criteria++) {
          var vote_sum = 0;

          // assumption - all votes corresponding to the same criteria have the same index in each array
          // e.g. notes[0].vote[0] corresponds to the Quality criteria and notes[1].vote[0] corresponds to the Quality criteria as well
          for (var curr_note = 0; curr_note < notes.length; curr_note++) {
            vote_sum += notes[curr_note].vote[curr_criteria].number;
          }

          proj_score += vote_sum; // Add the score of each criteria
          data[curr_criteria].push(vote_sum); // Push total into data
        }

        //total_scores[cat][curr_project] = proj_score;

        // Get the winner of a category
        if (proj_score > vm.winner_votes[cat] && proj_score > vm.secondary_winner_votes[cat]) {
          vm.secondary_winners[cat] = vm.winners[cat];
          vm.secondary_winner_votes[cat] = vm.winner_votes[cat];

          vm.winners[cat] = projects[curr_project].name;
          vm.winner_votes[cat] = proj_score;
        }

        // Get secondary winners
        else if (proj_score <= vm.winner_votes[cat] && proj_score > vm.secondary_winner_votes[cat]) {
          vm.secondary_winners[cat] = projects[curr_project].name;
          vm.secondary_winner_votes[cat] = proj_score;
        }


        $scope.labels[cat][curr_project] = projects[curr_project].name + " (" + notes.length + " votes - " + proj_score + " points)";
        projects[curr_project].vote_size = notes.length;  // Store how many votes a project has
      }
      $scope.data.push(data);     // Push 2D array of data corresponding to its category into $scope.data
      vm.projects.push(projects); // Push 1D array of projects corresponding to its category into vm.projects
    }

    // Determine winner of the entire hackathon
    for (let cat = 0; cat < vm.winners.length; cat++) {
      if (vm.winner_votes[cat] > vm.overall_winner_vote) {
        vm.overall_winner = vm.winners[cat];
        vm.overall_winner_vote = vm.winner_votes[cat];
        vm.overall_winner_index = cat;
      }
    }


    // If hackathon is active, get data from the blockhain
    if (vm.blockchain.length == 0 && vm.hackathon.active == true) {
      BlockService.get().then(function (res) {
        vm.blockchain = res.data;

        BlockService.set(vm.blockchain);
        for (var i = 0; i < vm.blockchain.length; i++) {
          console.log('Adding data for: ' + JSON.stringify(vm.blockchain[i]) + "\n");
          addDataToChart(vm.blockchain[i]);
        }
      });
    }



    // Upon getting a new block from the blockchain, add the data to the corresponding graph
    function addDataToChart(newestBlock) {
      var block = newestBlock.data;
      for (var cat = 0; cat < vm.hackathon.category.length; cat++) {
        var category = vm.hackathon.category[cat];

        if (category.name == block.category) {
          for (var proj = 0; proj < category.project.length; proj++) {
            // Store the summation of scores from each criteria for a project
            let proj_score = 0;

            var project = category.project[proj];

            if (project.name == block.recipient) {
              // now we have the project to apply the votes to.
              for (var curr_criteria = 0; curr_criteria < category.criteria.length; curr_criteria++) {
                var criteria = category.criteria[curr_criteria];

                if (criteria.name == block.vote[curr_criteria].criteria) {
                  // Add the new vote to the graph
                  let i = parseFloat($scope.data[cat][curr_criteria][proj]);
                  let j = parseFloat(block.vote[curr_criteria].value);
                  $scope.data[cat][curr_criteria][proj] = i + j;

                  proj_score += i + j;
                  if (curr_criteria == category.criteria.length - 1) {
                    //total_scores[cat][proj] = proj_score;

                    // Check to see if the current project is the new category winner
                    // If the project is the current winner, go to next else if statemtn
                    // Don't want to have a project be in vm.winners and vm.secondary_winners
                    if (proj_score > vm.winner_votes[cat] && project.name != vm.winners[cat]) {
                      // Secondary winner is previous category winner, new category winner is the current project
                      vm.secondary_winners[cat] = vm.winners[cat];
                      vm.secondary_winner_votes[cat] = vm.winner_votes[cat];

                      vm.winners[cat] = project.name;
                      vm.winner_votes[cat] = proj_score;
                    }
                    
                    // In case the current project is also the current winner, we need to update its total score
                    else if (proj_score > vm.winner_votes[cat] && project.name == vm.winners[cat]) {
                      vm.winner_votes[cat] = proj_score;
                    }

                    // Get secondary winners
                    else if (proj_score <= vm.winner_votes[cat] && proj_score > vm.secondary_winner_votes[cat] 
                      && project.name != vm.winners[cat]) {
                      vm.secondary_winners[cat] = project.name;
                      vm.secondary_winner_votes[cat] = proj_score;
                    }

                  }
                }
              }
              vm.vote_count[cat][proj] += 1;  // Increment how many votes this project has
              $scope.labels[cat][proj] = project.name + " (" + vm.vote_count[cat][proj] + " votes - " + proj_score + " points)";
              break;
            }
          }
          break;
        }
      }

      // Determine winner of the entire hackathon
      for (let cat = 0; cat < vm.winners.length; cat++) {
        if (vm.winner_votes[cat] > vm.overall_winner_vote) {
          vm.overall_winner = vm.winners[cat];
          vm.overall_winner_vote = vm.winner_votes[cat];
          vm.overall_winner_index = cat;
        }
      }

    }

    if (vm.hackathon.active == true) {
      init();
    }

    function init() {
      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('voteMessage', function (newBlock) {
        if (newBlock.type == 'vote') {

          addDataToChart(newBlock);
          vm.blockchain.push(newBlock);
          // add to existing total
        }
        console.log('New Block: ' + JSON.stringify(newBlock));
      });

      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('voteMessage');
      });
    }



    // Sample data for reference - found here: http://jtblin.github.io/angular-chart.js/
    /*
    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Series A', 'Series B'];
  
    var data1 = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
  
    var data2 = [
      [28, 48, 40, 19, 86, 27, 90],
      [65, 59, 80, 81, 56, 55, 40]
    ];
  
    $scope.data.push(data1);
    $scope.data.push(data2);*/
  }
}());
