# WhisperChirp — a url based chat room service.
To launch you must first create a file called app/js/vars.js with the following contents.
var SERVER_ADDRESS = "192.168.0.100";

Then create a file called server.app.js with the following contents (Replace port number).

var PORT = process.argv[2] && parseInt(process.argv[2], 10) || PORTNUMBER; 
var STATIC_DIR = __dirname + '/../app'; 
var TEST_DIR = __dirname + '/../test'; 
 
 require('./index').start(PORT, STATIC_DIR, TEST_DIR);
