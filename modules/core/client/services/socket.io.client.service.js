(function () {
  'use strict';

  // Create the Socket.io wrapper service
  angular
    .module('core')
    .factory('Socket', Socket);

  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      emit: emit,
      on: on,
      removeListener: removeListener,
      socket: null
    };

    connect();

    return service;

    // Connect to Socket.io server
    function connect() {
      // Connect only when authenticated
      // if (Authentication.user) {
        service.socket = io();
        // console.log('Connected in Core');
      // }
    }

    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        // console.log('Emit: ' + eventName + ' ' + JSON.stringify(data));
        service.socket.emit(eventName, data);
      }
    }

    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function (data) {
          $timeout(function () {
            // console.log('Socket On Data: ' + eventName + ' ' + data);
            callback(data);
          });
        });
      }
    }

    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        // console.log('Removed Listener: ' + eventName);
        service.socket.removeListener(eventName);
      }
    }
  }
}());
