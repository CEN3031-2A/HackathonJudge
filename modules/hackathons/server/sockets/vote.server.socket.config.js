
'use strict';

// Create the vote socket configuration
module.exports = function (io, socket) {
  //Emit the status event when a new socket client is connected
  io.on('connection', function (socket) {
    console.log('server connected');
  });

  socket.on('voteMessage', function (message) {
    message.type = 'vote';
    message.created = Date.now();

    // Emit the 'chatMessage' event
    io.emit('voteMessage', message);
  });

};
