
'use strict';

// Create the vote socket configuration
module.exports = function (io, socket) {
  // Emit the status event when a new socket client is connected
  // io.emit('voteMessage', {
  //   type: 'status',
  //   data: 'Is now connected',
  //   created: Date.now(),
  // });

  socket.on('voteMessage', function (message) {
    message.type = 'vote';
    message.created = Date.now();

    // Emit the 'chatMessage' event
    io.emit('voteMessage', message);
  });

};
