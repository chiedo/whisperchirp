var socket = io.connect('http://localhost');
var chatroom = window.location.pathname.split('/').pop();
var username;
var hopefully_id;


// Check if the user has an id for this room. If so assign it otherwise create it.
if(wc.getCookie(chatroom + "&userid")) {
   hopefully_id = wc.getCookie(chatroom + "&userid");
}
else {
  hopefully_id = Math.floor((Math.random()*1000000000000)+1);
  wc.setCookie(chatroom + "&userid",hopefully_id,30);
}

//Setup style for coding messages
$('head').append("<style id='dynamic-style'>.u"+hopefully_id+" { color: blue; } </style>");

username = prompt("Please enter your name");
wc.setCookie(chatroom + "&username",username,30);
if(username == null) username = "Guest";
if(username != "Guest") username = username + " (Guest)";

//set the username anywhere where it should be set
$(".display-username").text(username);

// Connect to the chatroom
socket.emit('connect',{chatroom: chatroom,username: username });
socket.emit('request chat history',{chatroom: chatroom});

socket.on('console log', function (data) {
  console.dir(data);
});

$("#chat-box").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      socket.emit('new message',{chatroom: chatroom, username: username,userid:hopefully_id, message: $("#chat-box").val() });
      $(this).val("");
    }
});

socket.on('new message', function (data) {
  var message = data["message"];
  var username = data["username"];
  var userid = data["userid"];
  $('#chat-room').append("<div class='chat-message'><b class='username u"+userid+"' userid="+userid+">"+username+"</b>: "+message+"</div>");
  
});

socket.on('provide chat history', function (data) {
  var id = data["id"];
  var history = $('#chat-room').html();
  socket.emit('import chat history',{id: id, history: history});
});

socket.on('import chat history', function (data) {
  socket.emit("import chat history");
});

socket.on('set chat history', function (data) {
  var history = data["history"];
  $('#chat-room').html(history);
});

window.onbeforeunload = function() {
  socket.onclose = function () {}; // disable onclose handler first
  socket.close();
};
