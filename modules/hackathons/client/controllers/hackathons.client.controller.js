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

    vm.months = [
      {name: 'January', num: 1},
      {name: 'February', num: 2},
      {name: 'March', num: 3},
      {name: 'April', num: 4},
      {name: 'May', num: 5},
      {name: 'June', num: 6},
      {name: 'July', num: 7},
      {name: 'August', num: 8},
      {name: 'September', num: 9},
      {name: 'October', num: 10},
      {name: 'November', num: 11},
      {name: 'December', num: 12}
    ];

    vm.currentYear = parseInt(new Date().toJSON().substr(0,4), 10);

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
