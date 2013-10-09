var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var server2 = require('http').createServer(app);
  var io = require('socket.io').listen(server);
  var webRTC = require('webrtc.io').listen(server2);

  var users_online = new Array();

  app.set('views', STATIC_DIR + '/views');
  app.set('view engine', 'jade');
  //app.use(express.logger('dev'));

  //this sets the static path to provide all static files
  app.use('/static',express.static(STATIC_DIR));
  
  server.listen(PORT);
  server2.listen(4000);

  app.get('/', function (req, res) {
    res.render('index',
      { title : 'Home' }
    );
  });

  app.get('/:chatroom', function (req, res) {
    res.render('chatroom',
      { title : 'Chatroom' }
    );
  });

  app.get('*', function (req, res) {
    res.render('404',
      { title : '404' }
    );
  });

  io.sockets.on('connection', function (socket) {
    /*
    Connect the client to a chatroom
    */
    socket.on('connect', function (data) {
      data = clean_data(data);
      var chatroom = data["chatroom"].toLowerCase(); 
      var username = data["username"]; 
      var user_id = data["user_id"]; 

      var users_in_chatroom = 1;

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] === chatroom) {
          users_in_chatroom++;
          if(users_online[i]["user_id"] === user_id ) socket.emit("recieve already in this room");
        }
      }

      data["users_in_chatroom"] = users_in_chatroom;

      users_online.push({ socket_id: socket.id, chatroom: chatroom, user_id: user_id, username: username  });
      sendToChatRoom(chatroom,socket.id,"recieve new user online", data);
    });

    socket.on('disconnect', function (data) {
      data = clean_data(data);
      var socket_data = getSocketData(socket.id);
      var chatroom = socket_data["chatroom"];

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["socket_id"] == socket.id) { 
          sendToChatRoom(chatroom,socket.id,"recieve user offline", {user_id: users_online[i]["user_id"], username: users_online[i]["username"]});
          users_online.splice(i, 1);
          break;
        }
      };
    });

    /*
    Send message to all of the users who are online
    */
    socket.on('give new message', function (data) {
      data = clean_data(data);
      var chatroom = data["chatroom"].toLowerCase();
      data["timestamp"] = new Date();
      sendToChatRoom(chatroom,socket.id,"recieve new message", data);
      socket.emit("recieve new message", data);
    });

    socket.on('request all users online', function (data) {
      data = clean_data(data);
      var chatroom = data["chatroom"].toLowerCase();
      var user_id = data["user_id"];
      var users_in_chatroom = new Array();
      var number_of_users_online = 1;

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          if(users_online[i]["user_id"] != user_id) {
            users_in_chatroom.push({user_id: users_online[i]["user_id"],username: users_online[i]["username"]});
            number_of_users_online++;
          }
        }
      }
      socket.emit("recieve all users online", {users_in_chatroom: users_in_chatroom, number_of_users_online: number_of_users_online});
    });

    socket.on('name change', function (data) {
      data = clean_data(data);
      var username = data["username"];
      var socket_data = getSocketData(socket.id);
      var chatroom = socket_data["chatroom"];
      socket_data["username"] = username;
      setSocketUsername(socket.id, username);

      sendToChatRoom(chatroom,socket.id,"recieve name change", socket_data);
      socket.emit("recieve name change",socket_data);
    });

    socket.on('give photo change', function (data) {
      data = clean_data(data);
      var user_id = data["user_id"];
      var chatroom = data["chatroom"].toLowerCase();

      sendToChatRoom(chatroom,socket.id,"receive photo change", data);
    });

    /*
    Request the chat data for the chatroom from the oldest user in the room
    */
    socket.on('request chat history', function (data) {
      var socket_id = socket.id;
      var socket_data = getSocketData(socket_id);
      var user_id = socket_data["user_id"];
      var chatroom = socket_data["chatroom"].toLowerCase();

      for (var i = 0; i < users_online.length; i++) {
        if(users_online[i]["chatroom"] == chatroom) {
          io.sockets.socket(users_online[i]["socket_id"]).emit("give chat history",{user_id: user_id, chatroom: chatroom});
          break;
        }
      };
    });

    socket.on('give chat history', function (data) {
      data = clean_data(data);
      var user_id = data["user_id"];
      var chatroom = data["chatroom"].toLowerCase();
      var history = data["history"];
      io.sockets.socket(getSocketId(chatroom,user_id)).emit("recieve chat history",{user_id: user_id, chatroom: chatroom,history: history});
     });

    socket.on('recieve chat history', function (data) {
      data = clean_data(data);
      var user_id = data["user_id"];
      var chatroom = data["chatroom"].toLowerCase();
      io.sockets.socket(getSocketId(chatroom,user_id)).emit("recieve chat history",{history: data["history"]});
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

  function sendToChatRoom(chatroom, socket_id,func,data) {
    for (var i = 0; i < users_online.length; i++) {
      if(users_online[i]["chatroom"] == chatroom && users_online[i]["socket_id"] != socket_id) {
        io.sockets.socket(users_online[i]["socket_id"]).emit(func,data);
      }
    }
  }

  function clean_data(x) {
    for (var key in x) {
      if (x.hasOwnProperty(key)) {
        if(typeof x[key] === 'undefined') x[key] == "System Alert: Avoid This user";
        if(key == "history") {
          for(var i = 0; i < x[key].length; i++) {
            // Here I actually need to make sure the format is correct. Here I need to check to see if any of the data is incorrect. If it is, send nothing
            x[key][i] = x[key][i].toString().replace(/(<([^>]+)>)/ig,"");
            for (var subkey in x[key][i]) {
              x[key][i][subkey] = x[key][i].toString().replace(/(<([^>]+)>)/ig,"");              
            }
          }
        }
        else if (typeof x[key] === 'object') {
          x[key] = "System Alert: Avoid this user."
        }
        else if (typeof x[key] === 'string') {
          x[key] = x[key].replace(/(<([^>]+)>)/ig,"");
        }
        if(key == "user_id") x[key] = parseInt(x[key]);
        if(key == "chatroom" || key == "username" || key == "userphoto") x[key] = x[key].toString();
      }
    }
    return x;
  }

  webRTC.rtc.on('chat_msg', function(data, socket) {
    var roomList = webRTC.rtc.rooms[data.room] || [];

    for (var i = 0; i < roomList.length; i++) {
      var socketId = roomList[i];

      if (socketId !== socket.id) {
        var soc = webRTC.rtc.getSocket(socketId);

        if (soc) {
          soc.send(JSON.stringify({
            "eventName": "receive_chat_msg",
            "data": {
              "messages": data.messages,
              "color": data.color
            }
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }
    }
  });
};
