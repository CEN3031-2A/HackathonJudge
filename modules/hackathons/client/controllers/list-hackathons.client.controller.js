(function () {
  'use strict';

  angular
    .module('hackathons')
    .controller('HackathonsListController', HackathonsListController);

  HackathonsListController.$inject = ['HackathonsService'];

  function HackathonsListController(HackathonsService) {
    var vm = this;

    vm.hackathons = HackathonsService.query();
  }
}());
