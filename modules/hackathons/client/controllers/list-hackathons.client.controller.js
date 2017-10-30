(function () {
  'use strict';

  angular
    .module('hackathons')
    .controller('HackathonsListController', HackathonsListController);

  HackathonsListController.$inject = ['HackathonsService'];

  function HackathonsListController(HackathonsService) {
    var vm = this;

    // Make the dates more readable
    HackathonsService.query().$promise.then(function (results) {
      angular.forEach(results, function(result) {
        var year = "";
        var month = "";
        
        var i = 0;
        while (result.date[i] != '-') {
          year += result.date[i];
          i++;
        }
        i++;

        while (result.date[i] != '-') {
          month += result.date[i];
          i++;
        }
        month = parseInt(month);
        
        switch(month) {
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

        result.string_date = month + " " + year;
      });

      vm.hackathons = results;
    });
  }
}());
