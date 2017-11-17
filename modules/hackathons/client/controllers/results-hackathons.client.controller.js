(function() {
'use strict';


angular.module("hackathons").controller("ResultsController", ResultsController);

ResultsController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve', 'Socket', 'BlockService'];

function ResultsController($scope, $stateParams, $state, $window, Authentication, hackathon, Socket, BlockService) {
  var vm = this;
  vm.authentication = Authentication;
  vm.hackathon = hackathon;

  // Graph variables
  $scope.labels = [];   // 2D array that holds x-axis labels for each graph -- e.g. $scope.labels[0] accesses labels for category 0
  $scope.series = [];   // 3D array that holds how many bars there will be per label (i.e. criteria) -- e.g. $scope.series[0] accesses criteria for category 0
  $scope.data = [];     // 3D array that holds data points for each graph -- e.g. $scope.data[0] accesses data points for category 0
  $scope.options = [];  // 1D array that holds how each graph will be structured - only part that changes per option is the title

  // Variables accessed by the results view
  vm.projects = [];   // 2D array which will hold the projects -- e.g. vm.projects[0] contains projects corresponding to category 0

  vm.blockchain = [];

  // Iterate over the categories to extract information for above variables
  for (var cat=0; cat < vm.hackathon.category.length; cat++) {
    // Variables which will be pushed into the respective $scope variables (series and data will be 2D arrays, labels is 1D, options is an object)
    var labels = [];  // 1D array
    var series = [];  // 2D array
    var data = [];    // 2D array

    var options = {
      legend: {
        display: true
      },

      title: {
        display: true,
        text: vm.hackathon.category[cat].name + " - Results"
      },

      scales: {
        yAxes: [{
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
    for (var i=0; i < projects.length; i++) {
      labels.push(projects[i].name);
    }

    $scope.labels.push(labels); // Push 1D array of labels into $scope.labels (forming 2D array)

    // Push criteria into series
    for(var i=0; i < criteria.length; i++) {
      series.push(criteria[i].name);
      data.push([]);                  // Push empty arrays to hold the votes later
    }

    $scope.series.push(series); // Push 1D array of series into $scope.series (forming 2D array)


    // Inside for loop to iterate across all projects
    for (var curr_project=0; curr_project < projects.length; curr_project++) {
      var notes = projects[curr_project].note;  // Store notes (and their associated votes as well)

      // Loop to iterate across all the votes corresponding to each criteria
      // Sum up all the votes for a given criteria of one project and then move to the next criteria until the end
      for (var curr_criteria=0; curr_criteria < criteria.length; curr_criteria++) {
        var vote_sum = 0;

        // assumption - all votes corresponding to the same criteria have the same index in each array
        // e.g. notes[0].vote[0] corresponds to the Quality criteria and notes[1].vote[0] corresponds to the Quality criteria as well
        for (var curr_note=0; curr_note < notes.length; curr_note++) {
          vote_sum += notes[curr_note].vote[curr_criteria].number;
        }

        data[curr_criteria].push(vote_sum); // Push total into data
      }

      projects[curr_project].vote_size = notes.length;  // Store how many votes a project has
    }

    $scope.data.push(data);     // Push 2D array of data corresponding to its category into $scope.data
    vm.projects.push(projects); // Push 1D array of projects corresponding to its category into vm.projects
  }


  if(vm.blockchain.length == 0 && vm.hackathon.active == true)
  {
    BlockService.get().then(function(res) {
      vm.blockchain = res.data;
      console.log('Received chain: ' + JSON.stringify(vm.blockchain));
      BlockService.set(vm.blockchain);
      for(var i = 0; i < vm.blockchain.length; i++)
      {
        addDataToChart(vm.blockchain[i]);
      }
    });
  }

  function addDataToChart(newestBlock)
  {
    var block = newestBlock.data;
    for(var cat=0; cat<vm.hackathon.category.length; cat++)
    {
      var category = vm.hackathon.category[cat];
      if(category.name == block.category)
      {
        for(var proj = 0; proj < category.project.length; proj++)
        {
          var project = category.project[proj];
          if(project.name == block.recipient)
          {
            // now we have the project to apply the votes to.
            for(var curr_criteria = 0; curr_criteria < category.criteria.length; curr_criteria++)
            {
              var criteria = category.criteria[curr_criteria];
              if(criteria.name == block.vote[curr_criteria].criteria)
              {
                $scope.data[cat][curr_criteria][proj] += block.vote[curr_criteria].value;
              }
            }
            break;
          }
        }
        break;
      }
      var str = "bar-" + block.category;
      var chart = document.getElementById(str);
      if(chart != null)
      {
        chart.update();
      }
    }
  }

  if(vm.hackathon.active == true)
  {
    init();
  }

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
        addDataToChart(newBlock);
        // add to existing total
      }
      console.log('New Block: ' + JSON.stringify(newBlock));
    });

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('voteMessage');
    });
  }

  // Sample data for reference
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
