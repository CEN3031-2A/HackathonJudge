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
    '$window', 'Authentication', 'hackathonResolve', '$http', 'JudgesService'];


  function HackathonsController($scope, $stateParams, $state, $window, Authentication, hackathon, $http, JudgesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.create = create;
    vm.addCategoryToHackathon = addCategoryToHackathon;
    vm.removeCategoryFromHackathon = removeCategoryFromHackathon;

    
    // Create a judge document (called in generateUID)
    function createJudge(email, id) {
      var newJudge = {
        email: email,
        id: id,
        vote: []
      }

      $http({method: 'POST', url: '/api/judges', data: newJudge}).then(function(res) {
        console.log("OK");
      }, function(err) {
        console.log("NO");
      });
    }

    /* Start of email sending code */

    vm.send = send;     // Register the send function
    vm.resend = resend; // Resend email if needed

    var json;           // Hold the AWS information
    var judges = [];    // Hold judges that will be generated when sending emails

    // Get AWS credentials and email from aws.json
    $http.get('modules/hackathons/client/config/aws.json').then(function (data) {
      json = data;
      json = json.data;
    });

    // Function for AWS to send emails
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

    // Function associated with the "Send Emails" button
    // Parses through the CSV, generates judge IDs for each email and calls the AWS sendMail function
    function send() {
      if (vm.hackathon.active == false) {
        alert("Hackathon is inactive; cannot send emails.");
        return;
      }
      var emails = [];  // Store emails
      try {
        let file = Papa.parse(vm.csvfile);  // Parse CSV

        // If the CSV file is empty, there will be an empty line and length of 1
        if (file.data.length == 1) {
          alert("Empty CSV file!");
          return;
        }

        // Store emails found in the CSV
        for (let i = 0; i < file.data.length; i++) {
          let email = String(file.data[i]);

          // If there are any empty lines, ignore them
          if (email != "") {

            // Eliminate the \t at the end of emails (appears if it's not the last email) 
            if (email.substr(email.length - 1, 1) == "\t") {
              email = email.substring(0, email.length - 1);
            }
            emails.push(email);
          }
        }
      }
      catch (err) {
        console.log(err);
        alert("No CSV file uploaded!");
        return;
      }

      // Load AWS credentials
      AWS.config.accessKeyId = json.accessKeyId;
      AWS.config.secretAccessKey = json.secretAccessKey;
      AWS.config.region = json.region;

      // Create AWS.SES object to prepare to send emails
      let ses = new AWS.SES({
        apiVersion: '2010-12-01'
      });

      let from = json.email;  // Get the sender email

      // Set subject of email to be: <hackathon_name> - Judge Link
      let subject = vm.hackathon.name;
      subject += " - Judge Link";

      generateUID(emails);    // Links emails and ids together - pushes object into judges

      for (let i = 0; i < vm.hackathon.judge.length; i++) {
        // Create an array of and push a single email each time to send
        // AWS only accepts arrays of emails, so it is not possible to send an email String as the destination
        let temp_email = [];
        temp_email.push(vm.hackathon.judge[i].email);

        // Body of the email is currently the judge ID
        let temp_body = vm.hackathon.judge[i].id;

        sendMail(ses, temp_email, from, subject, temp_body);
      }

      alert("Emails sent!");
    }

    // Generate unique IDs for each judge
    // Borrowed from StackOverflow: https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
    function generateUID(emails) {
      for (let i = 0; i < emails.length; i++) {
        // I generate the UID from two parts here 
        // to ensure the random number provide enough bits.
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        let temp_id = firstPart + secondPart;

        // Create judge to push to judges array
        let temp_judge = {
          email: emails[i],
          id: temp_id
        };
        judges.push(temp_judge);
        createJudge(emails[i], temp_id);
      }

      // Push new judges to the database and save
      vm.hackathon.judge = judges;
      vm.save(true);
    }

    // Resend emails to judges
    function resend() {
      if (vm.hackathon.active == false) {
        alert("Hackathon is inactive; cannot send emails.");
        return;
      }

      // If the user has not sent emails previously, then emails cannot be resent
      if (vm.hackathon.judge == undefined || vm.hackathon.judge.length == 0) {
        alert("There are no emails to resend! Upload a CSV file and use \"Send Emails\"");
        return;
      }

      // Load AWS credentials
      AWS.config.accessKeyId = json.accessKeyId;
      AWS.config.secretAccessKey = json.secretAccessKey;
      AWS.config.region = json.region;

      // Create AWS.SES object to prepare to send emails
      let ses = new AWS.SES({
        apiVersion: '2010-12-01'
      });

      let from = json.email;  // Get the sender email

      // Set subject of email to be: <hackathon_name> - Judge Link
      let subject = vm.hackathon.name;
      subject += " - Judge Link";

      for (let i = 0; i < vm.hackathon.judge.length; i++) {
        // Create an array of and push a single email each time to send
        // AWS only accepts arrays of emails, so it is not possible to send an email String as the destination
        let temp_email = [];
        temp_email.push(vm.hackathon.judge[i].email);

        // Body of the email is currently the judge ID
        let temp_body = vm.hackathon.judge[i].id;

        sendMail(ses, temp_email, from, subject, temp_body);
      }
      alert("Emails have been resent.");
    }

    /* End of email sending code */

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

    /* Code to dynamically add categories */

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

    function removeCategoryFromHackathon() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.hackathon.category.splice(vm.hackathon.category.indexOf(vm.catToUpdate), 1);
        vm.catToUpdate = null;
        vm.save(true);
      }
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
