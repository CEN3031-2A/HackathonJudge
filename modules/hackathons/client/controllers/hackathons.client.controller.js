(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('HackathonsController', HackathonsController)
    .directive("fileread", [function () {
      // Borrowed from StackOverflow https://stackoverflow.com/questions/17063000/ng-model-for-input-type-file
      return {
        scope: {
          fileread: "="
        },
        link: function (scope, element, attributes) {
          element.bind("change", function (changeEvent) {
            var reader = new FileReader();
            reader.onload = function (loadEvent) {
              scope.$apply(function () {
                scope.fileread = loadEvent.target.result;
              });
            }
            reader.readAsText(changeEvent.target.files[0]);
          });
        }
      }
    }]);

  HackathonsController.$inject = ['$scope', '$stateParams', '$state',
    '$window', 'Authentication', 'hackathonResolve', '$http'];


  function HackathonsController($scope, $stateParams, $state, $window, Authentication, hackathon, $http) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.create = create;
    vm.addProjectToCategory = addProjectToCategory;
    vm.addCriteriaToCategory = addCriteriaToCategory;
    vm.removeProjectFromCategory = removeProjectFromCategory;
    vm.removeCriteriaFromCategory = removeCriteriaFromCategory;
    vm.addCategoryToHackathon = addCategoryToHackathon;
    vm.removeCategoryFromHackathon = removeCategoryFromHackathon;

    //Testing file upload
    vm.send = send;
    var json;

    // Get AWS credentials and email from aws.json
    $http.get('modules/hackathons/client/config/aws.json').then(function (data) {
      json = data;
      console.log(json.data);
      json = json.data;
    });

    function sendMail(ses, to, from, subject, body) {
      //console.log('sending mail');
      ses.sendEmail({
        Source: from,
        Destination: {
          ToAddresses: to
        },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: body,
            }
          }
        }
      }, function (err, data) {
        if (err) {
          console.log('ERROR sending mail', err);
        }
        //console.log('Email sent:');
        //console.log(data);
      });
    }

    function send() {
      try {
        let file = Papa.parse(vm.csvfile);

        // Store emails
        let emails = [];
        for (let i = 0; i < file.data.length; i++) {
          // If there are any empty lines, ignore them
          if (String(file.data[i]) != "")
            emails.push(String(file.data[i]));
        }

        for (let i = 0; i < emails.length; i++) {
          console.log(emails[i]);
        }

        AWS.config.accessKeyId = json.accessKeyId;
        AWS.config.secretAccessKey = json.secretAccessKey;
        AWS.config.region = json.region;

        let ses = new AWS.SES({
          apiVersion: '2010-12-01'
        });

        let from = json.email;  // Get the sender email
        let subject = "Hackathon Judge test";
        let body = "Testing Hackathon Judge email system";

        sendMail(ses, emails, from, subject, body);
      }
      catch (err) {
        console.log(err);
        alert("No CSV file uploaded!");
      }
    }

    // if statement to deal with the creation page (because it has no date field, no need to go through this)
    if (vm.hackathon.date != null) {
      // Make the date more readable
      var year = "";
      var month = "";

      var i = 0;
      while (vm.hackathon.date[i] != '-') {
        year += vm.hackathon.date[i];
        i++;
      }
      i++;

      while (vm.hackathon.date[i] != '-') {
        month += vm.hackathon.date[i];
        i++;
      }
      month = parseInt(month);

      switch (month) {
        case 1:
          month = "January";
          break;
        case 2:
          month = "February";
          break;
        case 3:
          month = "March";
          break;
        case 4:
          month = "April";
          break;
        case 5:
          month = "May";
          break;
        case 6:
          month = "June";
          break;
        case 7:
          month = "July";
          break;
        case 8:
          month = "August";
          break;
        case 9:
          month = "September";
          break;
        case 10:
          month = "October";
          break;
        case 11:
          month = "November";
          break;
        case 12:
          month = "December";
      }

      vm.hackathon.string_date = month + " " + year;


      // Also convert the date into a Date object
      vm.hackathon.date = new Date(vm.hackathon.date);
    }

    if ($stateParams.cat != null) {
      vm.catToUpdate = hackathon.category[$stateParams.cat];
      vm.cat = $stateParams.cat;
    }

    // Remove existing Hackathon
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.hackathon.$remove($state.go('hackathons.list'));
      }
    }

    // Create new Hackathon
    function create() {
      vm.hackathon = new Hackathon();
    }

    function addProjectToCategory() {
      var newProj = {
        name: '',
        description: '',
        link: ''
      };
      vm.catToUpdate.project[vm.catToUpdate.project.length] = newProj;
    }

    function addCriteriaToCategory() {
      var newCriteria = {
        name: '',
        description: '',
        input_type: ''
      };
      vm.catToUpdate.criteria[vm.catToUpdate.criteria.length] = newCriteria;
    }

    function addCategoryToHackathon(save) {
      var newCategory = {
        name: 'New Category',
        description: ''
      };
      vm.hackathon.category[vm.hackathon.category.length] = newCategory;
      if (save) {
        vm.save(true);
      }
    }

    function removeProjectFromCategory(project) {
      vm.catToUpdate.project.splice(vm.catToUpdate.project.indexOf(project), 1);
    }

    function removeCriteriaFromCategory(criteria) {
      vm.catToUpdate.criteria.splice(vm.catToUpdate.criteria.indexOf(criteria), 1);
    }

    function removeCategoryFromHackathon() {
      vm.hackathon.category.splice(vm.hackathon.category.indexOf(vm.catToUpdate), 1);
      vm.catToUpdate = null;
      vm.save(true);
    }

    // Save Hackathon
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.hackathonForm');
        return false;
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
