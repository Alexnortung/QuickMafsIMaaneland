var express = require('express');
var app = express();
var http = require('http').Server(app);
var mysql = require('mysql');
var io = require('socket.io')(http);

app.use("/", express.static(__dirname + "/game"));

app.listen(3000, () => console.log('Example app listening on port 3000!'))

io.on('connection', function(socket){
  console.log('a user connected');
});
