var express = require('express');
var app = express();
var http = require('http').Server(app);
var mysql = require('mysql');
var io = require('socket.io')(http);
var sqlS = require('./sqlSetup.js');

app.use("/", express.static(__dirname + "/game"));

app.listen(3000, () => console.log('Example app listening on port 3000!'))

io.on('connection', function(socket)
{
  console.log('a user connected');

  socket.on('disconnect', function()
  {
  console.log('user disconnected');
  });
});

sqlS.SetupMySql(mysql);
var con = sqlS.CreateNewCon(mysql);
sqlS.CreateUserTable(con);
sqlS.CreateMatchesTable(con);
