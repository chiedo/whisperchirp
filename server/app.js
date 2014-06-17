var PORT = process.env.PORT || 5000; 
var STATIC_DIR = __dirname + '/../app'; 
var TEST_DIR = __dirname + '/../test'; 

require('./index').start(PORT, STATIC_DIR, TEST_DIR);
