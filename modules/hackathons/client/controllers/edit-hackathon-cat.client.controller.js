(function () {
  'use strict';

  // Hackathons controller
  angular
    .module('hackathons')
    .controller('CategoryController', CategoryController);

  CategoryController.$inject = ['$scope', '$stateParams', '$state',
    '$window', 'Authentication', 'hackathonResolve'];

  function CategoryController($scope, $stateParams, $state, $window, Authentication, hackathon) {
    var vm = this;

    vm.authentication = Authentication;
    vm.hackathon = hackathon;
    vm.error = null;
    vm.form = {};
    vm.save = save;
    vm.addProjectToCategory = addProjectToCategory;
    vm.addCriteriaToCategory = addCriteriaToCategory;
    vm.removeProjectFromCategory = removeProjectFromCategory;
    vm.removeCriteriaFromCategory = removeCriteriaFromCategory;
    vm.removeCategoryFromHackathon = removeCategoryFromHackathon;
		
    /* Code to dynamically add projects and criteria to a category */
    
    if ($stateParams.cat != null) {
      vm.catToUpdate = hackathon.category[$stateParams.cat];
      vm.cat = $stateParams.cat;
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

    function removeProjectFromCategory(project) {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.catToUpdate.project.splice(vm.catToUpdate.project.indexOf(project), 1);
      }
    }

    function removeCriteriaFromCategory(criteria) {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.catToUpdate.criteria.splice(vm.catToUpdate.criteria.indexOf(criteria), 1);
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