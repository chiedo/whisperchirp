var PORT = process.argv[2] && parseInt(process.argv[2], 10) || 3000;
var STATIC_DIR = __dirname + '/../app';
var TEST_DIR = __dirname + '/../test';

require('./index').start(PORT, STATIC_DIR, TEST_DIR);
