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
    '$window', 'Authentication', 'hackathonResolve', '$http', 'JudgesService', 'BlockService'];


  function HackathonsController($scope, $stateParams, $state, $window, Authentication, hackathon, $http, JudgesService, BlockService) {
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
    vm.archive = archive;

    vm.judges = JudgesService.query();

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
    // $http.get('modules/hackathons/client/config/aws.json').then(function (data) {
    //   json = data;
    //   json = json.data;
    // });

    var headers = {"Authorization": "Basic cm1vbGx3YXlAdWZsLmVkdTpSTTkyMTEwNA==", "Accept": "application/vnd.heroku+json; version=3"};
    $http.get('https://api.heroku.com/apps/hackathonjudge/config-vars', {headers: headers}).then(function(data){
      json = data;
      json = json.data;
      // console.log(JSON.stringify(json));
    });

    // Function for AWS to send emails
    function sendMail(ses, to, from, subject, body) {
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
      });
    }

    // Function associated with the "Send Emails" button
    // Parses through the CSV, generates judge IDs for each email and calls the AWS sendMail function
    function send() {
      if (vm.hackathon.active == false) {
        alert("Hackathon is inactive; cannot send emails.");
        return;
      }

      // Check to see if the admin has already sent emails
      // If admin chooses to send new emails instead of resnding, old IDs will be wiped from the DB and new IDs will be created
      if (vm.hackathon.judge != undefined) {
        if (vm.hackathon.judge.length != 0) {
          if (!$window.confirm('You have already sent emails.\nDo you want to send new emails and generate new IDs for the judges? Old IDs will be removed and replaced.')) {
            return;
          }

          // Need to delete judges from judge collection since they are being overwritten
          let to_delete = []; // Store the judges that need to be deleted in the judge collection

          for (let i=0; i < vm.hackathon.judge.length; i++) {
            for (let j=0; j < vm.judges.length; j++) {
              if (vm.hackathon.judge[i].id == vm.judges[j].id) {
                to_delete.push(vm.judges[j]._id); // Store the MongoDB ID
                break;
              }
            }
          }

          // Delete the judges
          vm.hackathon.judge = [];
          for (let i=0; i < to_delete.length; i++) {
            let url = "/api/judges/";
            url += to_delete[i];
            $http({method: 'DELETE', url: url}).then(function(res) {
              console.log("Deleted");
            }, function(err) {
              console.log("Fail");
            });
          }

        }
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
        // Create an array of size one and push a single email each time to send
        // AWS only accepts arrays of emails, so it is not possible to send an email String as the destination email
        let temp_email = [];
        temp_email.push(vm.hackathon.judge[i].email);

        // Body of the email is link to the voting page
        let temp_body = "http://hackathonjudge.herokuapp.com/hackathons.projects.";
        temp_body += vm.hackathon.judge[i].id;

        sendMail(ses, temp_email, from, subject, temp_body);
      }

      let text = vm.hackathon.judge.length.toString();
      text += " emails have been sent!";
      alert(text);
    }

    // Generate unique IDs for each judge
    // Borrowed from StackOverflow: https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
    function generateUID(emails) {
      var id_array = [];  // Keep track of IDs in the unlikely event that there is a duplicate

      for (let i = 0; i < emails.length; i++) {
        var temp_id = undefined;  // Hold the ID

        while (temp_id == undefined) {
          // Generate the UID from two parts here
          // to ensure the random number provide enough bits.
          let firstPart = (Math.random() * 46656) | 0;
          let secondPart = (Math.random() * 46656) | 0;
          firstPart = ("000" + firstPart.toString(36)).slice(-3);
          secondPart = ("000" + secondPart.toString(36)).slice(-3);
          temp_id = firstPart + secondPart;

          // Check if the ID has already been generated (very unlikely)
          for (let j=0; j < id_array.length; j++) {
            if (id_array[j] == temp_id) {
              temp_id = undefined;  // There is a duplicate - need to create another ID
              break;
            }
          }
        }

        id_array.push(temp_id); // Keep track of IDs

        // Create judge to push to judges array
        let temp_judge = {
          email: emails[i],
          id: temp_id
        };
        judges.push(temp_judge);  // To store judges in the hackathon collection
        createJudge(emails[i], temp_id);  // To store judges in the judge collection
      }

      // Push new judges to the hackathon collection and save
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

        // Body of the email is link to the voting page
        let temp_body = "http://hackathonjudge.herokuapp.com/hackathons.projects.";
        temp_body += vm.hackathon.judge[i].id;

        sendMail(ses, temp_email, from, subject, temp_body);
      }

      let text = vm.hackathon.judge.length.toString();
      text += " have been resent!";
      alert(text);
    }

    /* End of email sending code */

    // Check to see if the date needs to be more readable (if there is a date)
    if (vm.hackathon.date != null) {
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

      // String that will be displayed to the admin
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

    // takes in a block from the chain and saves it into the hackathon model
    // this is only called from the archive function
    function addVoteToHackathon(nextBlock) {

      var block = nextBlock.data;

      for(var cat = 0; cat < vm.hackathon.category.length; cat++) {
        var category = vm.hackathon.category[cat];
        if(category.name == block.category)
        {
          // find the project to add the votes to
          for(var proj = 0; proj < category.project.length; proj++) {
            var project = category.project[proj];
            if(project.name == block.recipient) {
              // now we have the project
              var vote = [];
              for(var i = 0; i < block.vote.length; i++) {
                vote[i] = {criteria_name: block.vote.criteria[i], number: block.vote.value[i]};
              }
              projct.note.text.push(block.note);
              project.note.vote.push(vote);
            }
          }
        }
      }
    }

    // Function to archive the active hackathon
    function archive() {
      if ($window.confirm('Are you sure you want to archive this Hackathon? This will clear the judges')) {
        vm.hackathon.active = false;

        // get the blockchain and store individual votes into the hackathon model
        BlockService.get().then(function(res) {
          let blockchain = res.data;
          for(var i = 0; i < blockchain.length; i++)
          {
            addVoteToHackathon(blockchain[i]);
          }
        });

        // now we need to clear the judges
        if (vm.hackathon.judge != undefined) {
          let to_delete = []; // Store the judges to delete

          // Get the judges that belong to the current hackathon to delete
          // There should be only one active hackathon at a time, so all judges
          // from the judge collection will be deleted
          for (let i=0; i < vm.hackathon.judge.length; i++) {
            for (let j=0; j < vm.judges.length; j++) {
              if (vm.hackathon.judge[i].id == vm.judges[j].id) {
                to_delete.push(vm.judges[j]._id); // Store the MongoDB ID
                break;
              }
            }
          }

          // Delete the judges
          vm.hackathon.judge = [];
          for (let i=0; i < to_delete.length; i++) {
            let url = "/api/judges/";
            url += to_delete[i];
            $http({method: 'DELETE', url: url}).then(function(res) {
              console.log("Deleted");
            }, function(err) {
              console.log("Fail");
            });
          }
        }

        // now we need to clear the blockchain & save the genesis block to set
        // it up for the next active hackathon
        BlockService.clear().then(function() {
          BlockService.saveGenesisBlock();
        });

        // finally, save the hackathon
        vm.save(true);
      }
    }

  }
}());
