//var socket = io.connect('http://192.168.0.4');
var socket = io.connect('http://192.168.0.100');
var chatroom = window.location.pathname.split('/').pop().toLowerCase();
var username;
var useremail;
var userphoto = "http://www.gravatar.com/avatar/none";
var user_id;
var new_message_sound = new Audio("/static/mp3/new-message-sound.mp3");

var users_online = new Array();
var users_in_chatroom = 0;
var chat_colors = new Array("#cc2a36","#00a0b0","#eb6841","#67204e","#4f372d");

// Check if the user has an id for this room. If so assign it otherwise create it.
if(wc.getCookie(chatroom + "&user_id")) {
   user_id = wc.getCookie(chatroom + "&user_id");
}
else {
  user_id = Math.floor((Math.random()*1000000000000)+1);
  wc.setCookie(chatroom + "&user_id",user_id,30);
}


//Setup style for coding messages for client
users_online.push(user_id);
$("#settings-pane").attr("userid",user_id);
$("#settings-pane").addClass("u"+user_id);
wc.setUserColors(user_id,"#1464a8");
$('#dynamic-style').append(".u"+user_id+" .chat-username { color: #1464a8; }");

// Check if the user has a photo for this room. If so assign it otherwise create it.
if(wc.getCookie(chatroom + "&userphoto")) userphoto = wc.getCookie(chatroom + "&userphoto");
wc.updateChatPhoto(userphoto,user_id);

// Set the username or prompt for it if its needed
if(wc.getCookie(chatroom+"&username") === null || typeof wc.getCookie(chatroom+"&username") === "undefined" || wc.getCookie(chatroom+"&username") === "Guest") {
  wc.changeName();
} else {
  username = wc.getCookie(chatroom+"&username");
}
$("#settings-pane .chat-username").text(username);

// Connect to the chatroom
socket.emit('connect',{chatroom: chatroom, username: username, user_id: user_id });
socket.emit('request chat history');
socket.emit('get all users online',{chatroom: chatroom,user_id: user_id});

//Initialize webrtcio
webrtcioInit();

socket.on('console log', function (data) {
  console.dir(data);
});

socket.on('new user online', function (data) {
  var user_id = data["user_id"];
  var username = data["username"];
  users_in_chatroom = data["users_in_chatroom"];
  wc.updateUsersInChatroom(users_in_chatroom);
 
  wc.newUser(user_id,username);
  console.dir(username + " is online");
  console.dir(users_in_chatroom+" others online.");

  if(users_online.indexOf(user_id) == -1) wc.newUser(user_id,username);
});

socket.on('user offline', function (data) {
  var user_id = data["user_id"];
  var username = data["username"];

  users_in_chatroom--;
  wc.updateUsersInChatroom(users_in_chatroom);
  $("#users-online-pane .u"+user_id).remove();
  console.dir(username + " is offline");
  console.dir(users_in_chatroom+" users online.");
});

$("#chat-box").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      socket.emit('new message',{chatroom: chatroom, username: username,user_id:user_id, userphoto: userphoto, message: $("#chat-box").val() });
      $(this).focus();
      $(this).val("");
      wc.resetRange($(this));
    }
});

$("#change-name").click(function(){
  wc.changeName();
});

$("#change-photo").click(function(){
  wc.changePhoto();
});

socket.on('already in this room', function (data) {
  alert("You are in this room in another tab. Please close this window to avoid strange behavior.");
});

socket.on('new message', function (data) {
  var message = data["message"];
  var username = data["username"];
  var userphoto = data["userphoto"];
  var user_id = data["user_id"];
  var timestamp = data["timestamp"];

  $('#chat-messages').append("\
    <div class='chat-message-section u"+user_id+"' user_id='"+user_id+"' timestamp='"+timestamp+"'>\
      <div class='chat-message-picture'>\
        <img class='chat-userphoto' src='"+userphoto+"' />\
      </div>\
      <div class='chat-message-text'>\
        <div class='chat-username'>"+username+"</div>\
        <div class='chat-message'>"+message+"</div>\
      </div>\
    </div>\
    <div class='clear'></div>\
  ");

  $("#chat-pane").scrollTop($("#chat-messages").height() * 2);
  new_message_sound.play();
  
});

socket.on('provide chat history', function (data) {
  var user_id = data["user_id"];
  var chatroom = data["chatroom"];
  var history = $('#chat-messages').html();
  socket.emit('import chat history',{chatroom: chatroom,user_id: user_id, history: history});
});

socket.on('import chat history', function (data) {
  socket.emit("import chat history");
});

socket.on('set chat history', function (data) {
  var history = data["history"];
  var user_id = data["user_id"];
  var chatroom = data["chatroom"];

  $('#chat-messages').html(history);
  $("#chat-pane").scrollTop($("#chat-messages").height() * 2);

});

socket.on('reflect name change', function (data) {
  var user_id = data["user_id"];
  var username = data["username"];
  $(".u"+user_id+" .chat-username").text(username);
});

socket.on('receive photo change', function (data) {
  var userphoto = data["userphoto"];
  var user_id = data["user_id"];

  $(".u"+user_id+" .chat-userphoto").attr("src",userphoto);
});

socket.on('set users online pane', function (data) {
  for (var i = 0; i < data.length; i++) {
    users_in_chatroom++;
    wc.newUser(data[i]["user_id"],data[i]["username"]);
  }
  wc.updateUsersInChatroom(users_in_chatroom);
});

window.onbeforeunload = function() {
  socket.onclose = function () {}; // disable onclose handler first
  socket.close();
};



/*
 * WEB RTC IO STUFF
 */
var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

function getNumPerRow() {
  var len = videos.length;
  var biggest;

  // Ensure length is even for better division.
  if(len % 2 === 1) {
    len++;
  }

  biggest = Math.ceil(Math.sqrt(len));
  while(len % biggest !== 0) {
    biggest++;
  }
  return biggest;
}

function setWH(video, i) {
  var perRow = getNumPerRow();
  var perColumn = Math.ceil(videos.length / perRow);
  var width = Math.floor((window.innerWidth) / perRow);
  var height = Math.floor((window.innerHeight - 190) / perColumn);
  video.width = width;
  video.height = height;
  video.style.left = (i % perRow) * width + "px";
  video.style.top = Math.floor(i / perRow) * height + "px";
}

function cloneVideo(domId, socketId) {
  var video = document.getElementById(domId);
  var clone = video.cloneNode(false);
  clone.id = "remote" + socketId;
  document.getElementById('videos').appendChild(clone);
  videos.push(clone);
  return clone;
}

function removeVideo(socketId) {
  var video = document.getElementById('remote' + socketId);
  if(video) {
    videos.splice(videos.indexOf(video), 1);
    video.parentNode.removeChild(video);
  }
}

function addToChat(msg, color) {
  var messages = document.getElementById('messages');
  msg = sanitize(msg);
  if(color) {
    msg = '<span style="color: ' + color + '; padding-left: 15px">' + msg + '</span>';
  } else {
    msg = '<strong style="padding-left: 15px">' + msg + '</strong>';
  }
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

function sanitize(msg) {
  return msg.replace(/</g, '&lt;');
}


var websocketChat = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_chat_msg'
};

var dataChannelChat = {
  send: function(message) {
    for(var connection in rtc.dataChannels) {
      var channel = rtc.dataChannels[connection];
      channel.send(message);
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};

function webrtcioInit() {
  if(PeerConnection) {
    rtc.createStream({
      "video": {"mandatory": {}, "optional": []},
      "audio": true
    }, function(stream) {
      document.getElementById('you').src = URL.createObjectURL(stream);
      document.getElementById('you').play();
      //videos.push(document.getElementById('you'));
      //rtc.attachStream(stream, 'you');
      //subdivideVideos();
    });
  } else {
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }


  var room = window.location.hash.slice(1);

  rtc.connect("ws://192.168.0.100:4000", chatroom);

  rtc.on('add remote stream', function(stream, socketId) {
    console.log("ADDING REMOTE STREAM...");
    var clone = cloneVideo('you', socketId);
    document.getElementById(clone.id).setAttribute("class", "");
    rtc.attachStream(stream, clone.id);
    subdivideVideos();
  });
  rtc.on('disconnect stream', function(data) {
    console.log('remove ' + data);
    removeVideo(data);
  });
}


