(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('HackathonsController', HackathonsController);

  HackathonsController.$inject = ['$scope', '$stateParams', '$state', '$window', 'Authentication', 'hackathonResolve'];

  function HackathonsController ($scope, $stateParams, $state, $window, Authentication, hackathon) {
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

    vm.hackathon.string_date = month + " " + year;

    
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
      if(save){
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
