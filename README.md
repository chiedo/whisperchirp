# WhisperChirp — a url based chat room service.

### Step 1
Create app/js/vars.js and insert SERVER_ADDRESS with the IP of your computer

    var SERVER_ADDRESS = "XXX.XXX.XXX.XXX";

### Step 2
Create server/app.js and insert following content, substituting XXXXX for desired port.

    var PORT = process.argv[2] && parseInt(process.argv[2], 10) || XXXXX; 
    var STATIC_DIR = __dirname + '/../app'; 
    var TEST_DIR = __dirname + '/../test'; 
 
    require('./index').start(PORT, STATIC_DIR, TEST_DIR);


### Step 3
Install all dependencies

    npm install

### Step 4
Start Server
 
    node server/app.js


### Step 5
Navigate to http://SERVER-IP:SERVER-PORT in 2 browsers (Chrome on both ends for now)
