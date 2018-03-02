var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var mysql = require('mysql');
var io = require('socket.io')(http);
var sqlS = require('./sqlSetup.js');

app.use("/", express.static(__dirname + "/game"));

sqlS.SetupMySql(mysql);
var con = sqlS.CreateNewCon(mysql);
sqlS.CreateUserTable(con);
sqlS.CreateMatchesTable(con);

io.on('connection', function(socket)
{
  console.log('a user connected');

  socket.on('disconnect', function()
  {
  console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
