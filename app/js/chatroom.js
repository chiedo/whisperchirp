var socket = io.connect('http://localhost');
var chatroom = window.location.pathname.split('/').pop();
var username;
var user_id;

var users_online = new Array();


// Check if the user has an id for this room. If so assign it otherwise create it.
if(wc.getCookie(chatroom + "&userid")) {
   user_id = wc.getCookie(chatroom + "&userid");
}
else {
  user_id = Math.floor((Math.random()*1000000000000)+1);
  wc.setCookie(chatroom + "&userid",user_id,30);
}

//Setup style for coding messages for client
users_online.push(user_id);
wc.setUserColors(user_id,"#1464a8");
$('#dynamic-style').append(".u"+user_id+" .chat-username { color: #1464a8; }");

// need to set allow user to enter username and set cookie. also needs to check to see if user has entered username.
// wc.setCookie(chatroom + "&username",username,30);
if(username == null) username = "Guest";
if(username != "Guest") username = username + " (Guest)";

//set the username anywhere where it should be set
$(".display-username").text(username);

// Connect to the chatroom
socket.emit('connect',{chatroom: chatroom,username: username, user_id: user_id });
socket.emit('request chat history',{chatroom: chatroom});

socket.on('console log', function (data) {
  console.dir(data);
});

socket.on('new user online', function (data) {
  if(users_online.indexOf(data["user_id"]) == -1) {
    users_online.push(data["user_id"]);
    wc.setUserColors(data["user_id"],wc.randomHex());
  }
});

$("#chat-box").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      socket.emit('new message',{chatroom: chatroom, username: username,userid:user_id, message: $("#chat-box").val() });
      $(this).focus();
      $(this).val("");
      wc.resetRange($(this));
    }
});

socket.on('new message', function (data) {
  var message = data["message"];
  var username = data["username"];
  var userid = data["userid"];
  var timestamp = data["timestamp"];

  $('#chat-messages').append("\
    <div class='chat-message-section u"+userid+"' userid='"+userid+"' timestamp='"+timestamp+"'>\
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
  var id = data["id"];
  var history = $('#chat-messages').html();
  socket.emit('import chat history',{id: id, history: history});
});

socket.on('import chat history', function (data) {
  socket.emit("import chat history");
});

socket.on('set chat history', function (data) {
  var history = data["history"];
  $('#chat-messages').html(history);
  $("#chat-pane").scrollTop($("#chat-messages").height() * 2);

  // Sets the colors for the other users in the chatroom
  $(".chat-message-section").each(function(){
    if(users_online.indexOf($(this).attr("userid")) == -1) {
      users_online.push($(this).attr("userid"));
      wc.setUserColors($(this).attr("userid"),wc.randomHex());
    }
  });
});

window.onbeforeunload = function() {
  socket.onclose = function () {}; // disable onclose handler first
  socket.close();
};

