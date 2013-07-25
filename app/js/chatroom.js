var socket = io.connect('http://localhost');
var chatroom = window.location.pathname.split('/').pop();
var username;
var user_id;

var users_online = new Array();
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
wc.setUserColors(user_id,"#1464a8");
$('#dynamic-style').append(".u"+user_id+" .chat-username { color: #1464a8; }");

// Set the username or prompt for it if its needed
if(wc.getCookie("username") === null || typeof wc.getCookie("username") === "undefined" || wc.getCookie("username") === "Guest") {
  username = prompt("Please enter your name:","Guest"); 
  username = jQuery.trim(username);
  wc.setCookie("username",username,365);
} else {
  username = wc.getCookie("username");
}

// Connect to the chatroom
socket.emit('connect',{chatroom: chatroom, username: username, user_id: user_id });
socket.emit('request chat history',{});

socket.on('console log', function (data) {
  console.dir(data);
});

socket.on('new user online', function (data) {
  var user_id = data["user_id"];
  if(users_online.indexOf(user_id) == -1) {
    wc.new_user(user_id);
  }
});

socket.on('user offline', function (data) {
  var user_id = data["user_id"];
  console.dir(user_id + " is offline");
});

$("#chat-box").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      socket.emit('new message',{chatroom: chatroom, username: username,user_id:user_id, message: $("#chat-box").val() });
      $(this).focus();
      $(this).val("");
      wc.resetRange($(this));
    }
});

socket.on('new message', function (data) {
  var message = data["message"];
  var username = data["username"];
  var user_id = data["user_id"];
  var timestamp = data["timestamp"];

  $('#chat-messages').append("\
    <div class='chat-message-section u"+user_id+"' user_id='"+user_id+"' timestamp='"+timestamp+"'>\
      <div class='chat-message-picture'>\
        <img src='/static/img/no-user-photo.gif' />\
      </div>\
      <div class='chat-message-text'>\
        <div class='chat-username'>"+username+"</div>\
        <div class='chat-message'>"+message+"</div>\
      </div>\
    </div>\
    <div class='clear'></div>\
  ");

  $("#chat-pane").scrollTop($("#chat-messages").height() * 2);
  
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

  // Sets the colors for the other users in the chatroom
  $(".chat-message-section").each(function(){
    if(users_online.indexOf($(this).attr("user_id")) == -1) {
      wc.new_user($(this).attr("user_id"));
    }
  });
});

window.onbeforeunload = function() {
  socket.onclose = function () {}; // disable onclose handler first
  socket.close();
};

wc.new_user = function(id) {
    users_online.push(id);
    if(chat_colors.length > 0) {
      wc.setUserColors(id,chat_colors[0]);
      chat_colors.splice(0,1);
    }
    else {
      wc.setUserColors(id,wc.randomHex());
    }
};
