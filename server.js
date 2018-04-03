var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
var mysql = require('mysql');
var io = require('socket.io')(http);
var sqlS = require('./sqlSetup.js');
var crypt = require('./passwordCrypt.js');
var queue = require('./Queue.js');
var question = require('./questions.js');

app.use("/", express.static(__dirname + "/game"));

var con;
sqlS.SetupMySqldev(mysql, function()
{
  con = sqlS.CreateNewCon(mysql)
  sqlS.CreateUserTable(con);
  sqlS.CreateMatchesTable(con);
  sqlS.CreateQuestions(con, function()
  {
    sqlS.CreateSubQuestions(con, function()
    {
      sqlS.CreateQuestionAndSubQuestions(con, function ()
      {
        http.listen(3000, function()
        {
        console.log('listening on: 3000');
        });
        var init = new queue.Init(io, con);
        
      });
    });
  });
});


var connections = [];





io.on('connection', function(socket)
{
  connections.push(socket);
  console.log("There are %s connections", connections.length);

/*
  socket.on('register', function(registerArray)
  {
    console.log("Consoled");
    RegisterUser(registerArray, socket, function()
    {
      console.log("User just registered");
    });
  });

  socket.on('findMathGame', function()
  {
    queue.findGame(socket, "1v1");
  });

  socket.on('login', function(LoginObject)
  {
    login(LoginObject.username, LoginObject.password, socket, function()
    {
      console.log("Inside Here?");
      console.log(socket.username + " Just logged in");
    });
  });*/

  socket.on('disconnect', function()
  {
    connections.splice(connections.indexOf(socket), 1);
    console.log("There are %s connections", connections.length);
  });
});

function RegisterUser(registerArray, socket, callback)
{
  crypt.cryptPassword(registerArray.password, function(err, EncryptedPassword)
  {
    if (err)
    {
      console.log("Failed Solving encryption");
    }
    else
    {
      var newArray = [[registerArray.username, EncryptedPassword, registerArray.displayname, 0, 1500, registerArray.email]];
      var sqlQuery = "INSERT INTO users (username, password, display_name, skill_level, Elo, Email) VALUES ?";
      con.query(sqlQuery, [newArray], function(err, result)
      {
        if (err)
        {
          console.log("Error: " + err);
          socket.emit('registerResult', "Error: " + err);
          return false;
        }
        else
        {
          socket.emit('registerResult', "User Registered");
          login(registerArray.username, registerArray.password, socket, function()
          {
            callback();
            return true;
          });
        }
      });
    }
  });
}

function login(username, password, socket, callback)
{
  var username = [[username]];
  var sqlQuery = "SELECT password, display_name, Email FROM users WHERE username = ?";
  if (typeof username !== "undefined" && username !== "" && typeof password !== "undefined" && password !== "")
  {
    con.query(sqlQuery, [username], function(err, result, fields)
    {
      if (err)
      {
        console.log("err: " + err);
      }
      else
      {
        console.log("Query Succesfully Worked");
        var dbPassword = result[0].password;
        var displayname = result[0].display_name;
        var email = result[0].Email;
        crypt.comparePassword(password, dbPassword, function(err, isMatch)
        {
          if (err)
          {
            console.log("Error: " + err)
          }
          else if (isMatch)
          {
            socket.login = true;
            socket.username = username;
            socket.password = password;
            socket.emit("LoggedMenu", socket.username);
            console.log("Player Logged In");
            console.log("Match: " + isMatch);
            callback();
          }
          else
          {
            console.log("Match: " + isMatch);
          }
        });
      }
    });
  }
}
