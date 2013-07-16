var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  var users_online = new Array();

  // This loads index.html
  app.use(express.static(STATIC_DIR));
  app.use(express.bodyParser());
  
  server.listen(PORT);
  app.get('/:chatroom', function (req, res) {
    res.sendfile('/Users/cj/Projects/whisperchirp/app/index.html');
  });

  io.sockets.on('connection', function (socket) {
    /*
    Connect the client to a chatroom
    */
    socket.on('connect', function (data) {
      var chatroom = data["chatroom"]; 
      var username = data["username"]; 

      users_online.push({ id: socket.id, chatroom: chatroom });

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom && users_online[i]["id"] != socket.id) {
          io.sockets.socket(users_online[i]["id"]).emit('console log',username + " is online");
        }
      };
      socket.emit('console log', "Users Online: " + users_online.length);
      socket.emit('console log', users_online);

    });

    socket.on('disconnect', function () {
      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["id"] == socket.id) users_online.splice(i, 1);
      };
    });

    /*
    Send message to all of the users who are online
    */
    socket.on('new message', function (data) {
      var chatroom = data["chatroom"];
      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          io.sockets.socket(users_online[i]["id"]).emit('new message',data);
        }
      };
    });

  });


};
