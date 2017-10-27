(function () {
    'use strict';
  
    angular
      .module('hackathons')
      .controller('ProjectsListController', ProjectsListController);
  
    ProjectsListController.$inject = ['ProjectsService'];
  
    function ProjectsListController(ProjectsService) {
      var vm = this;
  
      vm.hackathons = ProjectsService.query();
     
    }
  }());
  