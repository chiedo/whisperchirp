var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  var users_online = new Array();

  app.set('views', '/Users/cj/Projects/whisperchirp/app/views');
  app.set('view engine', 'jade');
  //app.use(express.logger('dev'));

  app.use('/static',express.static(STATIC_DIR));
  //app.use(express.bodyParser());
  
  server.listen(PORT);

  app.get('/', function (req, res) {
    //res.sendfile('/Users/cj/Projects/whisperchirp/app/views/404.html');
    res.render('home-index',
      { title : 'Home' }
    );
  });

  app.get('/:chatroom', function (req, res) {
    res.sendfile('/Users/cj/Projects/whisperchirp/app/views/chatroom-index.html');
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
