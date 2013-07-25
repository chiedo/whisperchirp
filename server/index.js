var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  var users_online = new Array();

  app.set('views', STATIC_DIR + '/views');
  app.set('view engine', 'jade');
  //app.use(express.logger('dev'));

  //this sets the static path to provide all static files
  app.use('/static',express.static(STATIC_DIR));
  
  server.listen(PORT);

  app.get('/', function (req, res) {
    res.render('home/index',
      { title : 'Home' }
    );
  });

  app.get('/:chatroom', function (req, res) {
    res.render('angular/index',
      { title : 'Chatroom' }
    );
  });

  app.get('*', function (req, res) {
    res.render('home/404',
      { title : '404' }
    );
  });

  io.sockets.on('connection', function (socket) {
    /*
    Connect the client to a chatroom
    */
    socket.on('connect', function (data) {
      var chatroom = data["chatroom"]; 
      var username = data["username"]; 
      var user_id = data["user_id"]; 

      users_online.push({ id: socket.id, chatroom: chatroom });

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom && users_online[i]["id"] != socket.id) {
          io.sockets.socket(users_online[i]["id"]).emit('console log',username + " is online");
        }
      };
      socket.emit('console log', "Users Online: " + users_online.length);
      socket.broadcast.emit('new user online', data);

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
      data["timestamp"] = new Date();
      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          io.sockets.socket(users_online[i]["id"]).emit('new message',data);
        }
      };
    });

    /*
    Request the chat data for the chatroom from the oldest user in the room
    */
    socket.on('request chat history', function (data) {
      var chatroom = data["chatroom"];
      var history;
      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          io.sockets.socket(users_online[i]["id"]).emit("provide chat history",{id: socket.id});
          break;
        }
      };
    });

    socket.on('provide chat history', function (data) {
      var id = data["id"];
      var history = data["history"];

      io.sockets.socket(id).emit("import chat history",{history: history});
    });

    socket.on('import chat history', function (data) {
      io.sockets.socket(data["id"]).emit("set chat history",{history: data["history"]});
    });

  });


};
