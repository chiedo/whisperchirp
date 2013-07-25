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
      var username = data["username"]; 
      users_online.push({ socket_id: socket.id, chatroom: chatroom, user_id: user_id, username: username  });

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom && users_online[i]["id"] != socket.id) {
          io.sockets.socket(users_online[i]["socket_id"]).emit('console log',username + " is online");
        }
      };

    });

    socket.on('disconnect', function () {
      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["socket_id"] == socket.id) { 
          socket.broadcast.emit('user offline', {user_id: users_online[i]["user_id"]} );
          users_online.splice(i, 1);
        }
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
          io.sockets.socket(users_online[i]["socket_id"]).emit('new message',data);
        }
      };
    });

    /*
    Request the chat data for the chatroom from the oldest user in the room
    */
    socket.on('request chat history', function (data) {
      var socket_id = socket.id;
      var socket_data = getSocketData(socket_id);
      var user_id = socket_data["user_id"];
      var chatroom = socket_data["chatroom"];

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          io.sockets.socket(users_online[i]["socket_id"]).emit("provide chat history",{user_id: user_id, chatroom: chatroom});
          break;
        }
      };
    });

    socket.on('provide chat history', function (data) {
      var user_id = data["user_id"];
      var chatroom = data["chatroom"];
      var history = data["history"];
      io.sockets.socket(getSocketId(chatroom,user_id)).emit("import chat history",{user_id: user_id, chatroom: chatroom,history: history});
    });

    socket.on('name change', function (data) {
      var username = data["username"];
      var socket_data = getSocketData(socket.id);
      socket_data["username"] = username;
      setSocketUsername(socket.id, username);

      socket.broadcast.emit("reflect name change",socket_data);
      socket.emit("reflect name change",socket_data);
    });

    socket.on('import chat history', function (data) {
      var user_id = data["user_id"];
      var chatroom = data["chatroom"];
      console.dir("DATA: " + data);
      io.sockets.socket(getSocketId(chatroom,user_id)).emit("set chat history",{history: data["history"]});

    });

  });

  function getSocketId(chatroom,user_id) {
    for (var i = 0; i < users_online.length; i++) {
      if(users_online[i]["chatroom"] == chatroom && users_online[i]["user_id"] == user_id)
        return users_online[i]["socket_id"];
    };

    return null;
  }

  function getSocketData(socket_id) {
    for (var i = 0; i < users_online.length; i++) {
      if(users_online[i]["socket_id"] === socket_id)
        return { chatroom: users_online[i]["chatroom"], user_id: users_online[i]["user_id"]};
    };

    console.log("There are no users fitting that criteria, Socket Id: " + socket_id);
    return {};
  }

  function setSocketUsername(socket_id,username) {
    for (var i = 0; i < users_online.length; i++) {
      if(users_online[i]["socket_id"] == socket_id) users_online[i]["username"] = username;
    };
  }


};
