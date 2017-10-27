(function () {
  'use strict';

  angular
    .module('hackathons')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Hackathons',
      state: 'hackathons',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'hackathons', {
      title: 'List Hackathons',
      state: 'hackathons.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'hackathons', {
      title: 'Create Hackathon',
      state: 'hackathons.create',
      roles: ['user']
    });
  }
}());
