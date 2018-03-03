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

  socket.on('register', function(registerArray)
  {
    RegisterUser(registerArray, socket);
  });

  socket.on('disconnect', function()
  {
  console.log('user disconnected');
  });
});

function RegisterUser(registerArray, socket)
{
  var newArray = [registerArray.username, registerArray.password, registerArray.displayname, 0, 1500, registerArray.email];
  var sqlQuery = "INSERT INTO users (username, password, display_name, skill_level, Elo, Email) VALUES ?";
  con.query(sqlQuery, newArray, function(err, result) //(" + registerArray[0] + ", " + registerArray[1] + ", " + registerArray[4] + ", 0, 1500, " + registerArray[3] + ");", function(err, result)
  {
    if (err)
    {
      console.log("Error: " + err);
      socket.emit('registerResult', "Error: " + err);
    }
    else
    {
      socket.emit('registerResult', "Woow it worked");
    }
  });
}

http.listen(3000, function(){
  console.log('listening on: 3000');
});
