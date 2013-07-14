var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  var usersonline = new Array();
  var dumb;

  // This loads index.html
  app.use(express.static(STATIC_DIR));
  app.use(express.bodyParser());
  
  server.listen(PORT);
  app.get('/:chatroom', function (req, res) {
    var chatroom = req.params.chatroom;
    res.sendfile('/Users/cj/Projects/whisperchirp/app/index.html');

    io.sockets.on('connection', function (socket) {
      usersonline.push({ id: socket.id, chatroom: "temporary" });
      //socket.broadcast.emit('user online', usersonline);
      if(chatroom.indexOf(".") == -1) {
        socket.broadcast.emit('user online', chatroom);
      }

      socket.on('sucess', function (data) {
        socket.broadcast.emit('success', { hello: 'success' });
      });
    });

  });


};
