var express = require('express');
var fs = require('fs');
var open = require('open');

exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  // This loads index.html
  app.use(express.static(STATIC_DIR));
  app.use(express.bodyParser());
  
  // This is another way to load index.html
  //app.get('/', function (req, res) {
  //  res.sendfile('/Users/cj/Projects/whisperchirp/app/index.html');
  //});

  server.listen(PORT, function() {
    //open('http://localhost:' + PORT + '/');
  });

  io.sockets.on('connection', function (socket) {
    socket.broadcast.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

};
