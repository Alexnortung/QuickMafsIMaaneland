//var ttt = require("./Krydsogbolle/Game.js");
var MathGame = require("./MathGame/MathGame.js").MathGame;
var gamesTypes = ["1v1", "ttt"];

function checkData(data) {
    if (typeof data == "object") {
        return data;
    }
    if (typeof data == "undefined") {
        //console.log("data is undefined");
        return false;
    } else if (typeof data == "string") {
        try {
            data = JSON.parse(data);
        } catch(e){
            //console.log("couldn't parse data from response", e);
            return false;
        }
    }

    if (typeof data != "object") {
        
        return false;
    }
    return data;
}

Init.prototype.findGame = function(socket, gameType) {
    var foundGame = false;
    var gameID;
    var queueNumber;
    var preparedRes = {};
    if (this.users[socket.id].ingame) {
        preparedRes.status = "ingame";
        preparedRes.message = "You are already in a game";
        socket.emit("findMatch", preparedRes);
        return;
    }
    else if (this.users[socket.id].inqueue) {
        preparedRes.status = "q";
        preparedRes.message = "You are already in the queue";
        socket.emit("findMatch", preparedRes);
        return;
    }
    else
    {
      console.log(socket.id + " neither queued nor already in game");
    }

    if (typeof this.queue[0] !== "undefined") {
        for (i = 0; i < this.queue.length; i++) {
            if (this.queue[i].gameType == gameType) {
                queueNumber = i;
                foundGame = true;
                break;
            }
        }
    }

    /* If game not found: put player in queue*/

    if (!foundGame) {
        this.queue.push({
            "socket": socket,
            "gameType": gameType
        });
        this.users[socket.id].inqueue = true;
        preparedRes.status = "q";
        preparedRes.message = "You are in the queue"; /*preparedRes.q = this.queue;*/
        socket.emit("findMatch", preparedRes);
    } else {
        var queueDetails = this.queue[queueNumber];
        this.queue.splice(queueNumber, 1);
        this.startGame([socket, queueDetails.socket], gameType);
    }
};

Init.prototype.startGame = function(players, gameType, privateGame, gameId)
{
    if (typeof gameId == "undefined") {
        gameId = this.currentGame;
    }
    for (i = 0; i < players.length; i++) {
        players[i].join("game" + this.currentGame);
        this.users[players[i].id].inqueue = false;
        this.users[players[i].id].ingame = true;
        this.users[players[i].id].gameType = gameType;
        this.users[players[i].id].gameID = gameId;
    }

    this.io.to("game" + this.currentGame).emit('findMathGame1v1', 'GameFound');

    var preparedGame = {};
    var thisInstance = this;
    if (gameType == "ttt") {
        this.preStartttt(players, preparedGame, gameId, privateGame);
    } else if (gameType == "1v1") {
        this.preStartMathGame(players, preparedGame, gameId, privateGame);
    }
    preparedGame.gameType = gameType;
    preparedGame.players = players;
    this.games[this.currentGame] = preparedGame; /*this.io.to("game" + this.currentGame).emit("start", "game started");*/
    this.currentGame++;
};


Init.prototype.tttHandler = function(data, socket) {
    var thisInstance = this;
    if (data.action == "mark") {
        var token = thisInstance.users[socket.id].gameData.token;
        var x = data.x;
        var y = data.y;
        thisInstance.games[thisInstance.users[socket.id].gameID]
        .game.mark(token, x, y, function(markData) {
            socket.emit("debug", markData);
            var gameUpdateData = {};
            gameUpdateData.status = markData.status;
            if (markData.status == "success") {
                gameUpdateData.token = token;
                gameUpdateData.x = x;
                gameUpdateData.y = y;
                gameUpdateData.gameId = thisInstance.users[socket.id].gameID;
                thisInstance.io.to("game" + thisInstance.users[socket.id].gameID).emit("gameUpdate", gameUpdateData);
            }
        });
    }
};


Init.prototype.mathGameHandler = function(data, socket) {
    var d1 = checkData(data);
    if (d1 != false) {
        if (d1.action == "answer") {

        }
    }
};


Init.prototype.socketHandler = function(socket) {
    this.users[socket.id] = {};
    this.users[socket.id].inqueue = false;
    this.users[socket.id].ingame = false;
    this.users[socket.id].gameID = null;
    this.users[socket.id].gameType = null;
    this.users[socket.id].nickname = "";
    this.users[socket.id].gameData = {};
    var thisInstance = this;
    socket.on("action", function(data) {
      socket.broadcast.emit("action", data);
      socket.emit("action", data);
    });
    socket.on("prank", function(data) {
      socket.broadcast.emit("prank", data);
    });
    socket.on("test", function(data) {
      socket.emit("test", data);
    });
    socket.on("changeNickname", function(data) {
      thisInstance.users[socket.id].nickname = data;
      var preparedNicknameChange = {};
      if (thisInstance.users[socket.id].ingame == true) {
          preparedNicknameChange.nickname = data;
          preparedNicknameChange.gameId = thisInstance.users[socket.id].gameID;
          preparedNicknameChange.gameData = thisInstance.users[socket.id].gameData;
          thisInstance.io.to("game" + thisInstance.users[socket.id].gameID).emit("changeNickname", preparedNicknameChange);
      } else {
          preparedNicknameChange.nickname = data;
          socket.emit("changeNickname", preparedNicknameChange);
      }
    });

    socket.on("findGame", function (data) {
        if (gamesTypes.indexOf(data) != -1) {

        } else {
            //tell the client the gametype does not exist
        }
    })

    socket.on("findMathGame", function(data)
    {

      thisInstance.findGame(socket, "1v1");
    });


    socket.on("createPrivateGame", function(data) {
      if (data.gameType == gamesTypes[0] ) {
          if (!thisInstance.users[socket.id].ingame && !thisInstance.users[socket.id].inqueue) {
              thisInstance.startGame([socket], data.gameType, true);
          } else {
              var preparedResponse = {};
              preparedResponse.status = "invalid";
              preparedResponse.message = "you are ingame or in the queue";
              socket.emit("privateGameResponse", preparedResponse);
          }
      }
    });
    socket.on("joinPrivateGame", function(data) {
      var preparedJoinResponse = {}; /*checks if gameId is set*/
      if (typeof data.gameId !== "undefined") { /*checks if the game actually exists*/
          if (typeof thisInstance.games[data.gameId] !== 'undefined') { /*checks if the game is open or not*/
              if (thisInstance.games[data.gameId].status == "open") {
                  if (data.gameType == thisInstance.games[data.gameId].gameType) {
                      var preparedEmitStart = {};
                      preparedEmitStart.gameId = data.gameId; /*start the game*/
                      thisInstance.games[data.gameId].game.startGame(socket);
                      if (data.gameType == gamesTypes[0]) {
                          thisInstance.games[data.gameId].players[1] = socket;
                          thisInstance.users[socket.id].gameData.token = "circle";
                          for (i = 0; i < thisInstance.games[data.gameId].players.length; i++) {
                              preparedEmitStart.token = thisInstance.users[thisInstance.games[data.gameId].players[i].id].gameData.token;
                              if (i == 0) {
                                  preparedEmitStart.opponentNickname = thisInstance.users[thisInstance.games[data.gameId].players[1].id].nickname;
                              } else {
                                  preparedEmitStart.opponentNickname = thisInstance.users[thisInstance.games[data.gameId].players[0].id].nickname
                              }
                              thisInstance.games[data.gameId].players[i].emit("start", preparedEmitStart);
                          }
                      }
                      thisInstance.users[socket.id].inqueue = false;
                      thisInstance.users[socket.id].ingame = true;
                      thisInstance.users[socket.id].gameType = data.gameType;
                      thisInstance.users[socket.id].gameID = data.gameId; /*set game status as locked*/
                    thisInstance.games[data.gameId].status = "locked"; /*move player 2 to the room*/
                      socket.join("game" + data.gameId); /*emit start*/
                  }
              } else {
                  preparedJoinResponse.status = "unsuccessful";
                  preparedJoinResponse.message = "Game is not open";
                  socket.emit("joinPrivateGameResponse", preparedJoinResponse);
              }
          } else {
              preparedJoinResponse.status = "unsuccessful";
              preparedJoinResponse.message = "Game does not exist";
              socket.emit("joinPrivateGameResponse", preparedJoinResponse);
          }
      } else {
          preparedJoinResponse.status = "unsuccessful";
          preparedJoinResponse.message = "GameID is not provided";
          socket.emit("joinPrivateGameResponse", preparedJoinResponse);
      }
    });
    socket.on("gameAction", function(data) {
      socket.emit("debug", data);
      if (thisInstance.users[socket.id].ingame) {
          if (thisInstance.users[socket.id].gameType == "ttt") {
              thisInstance.tttHandler(data, socket);
          } else if (thisInstance.users[socket.id].gameType == "1v1") {
            thisInstance.mathGameHandler(data, socket);
          }



      } else {
          var preparedRes = {};
          preparedRes.status = "not ok";
          preparedRes.message = "you are not in a game";
          socket.emit("gameUpdate", preparedRes);
      }
    });
    socket.on("disconnect", function() {
      if (thisInstance.users[socket.id].inqueue) {
          for (var i = 0; i < thisInstance.queue.length; i++) {
              if (typeof thisInstance.queue[i] !== "undefined") {
                  if (socket.id == thisInstance.queue[i].socket.id) {
                      delete thisInstance.queue[i];
                      break;
                  }
              }
          }
      }
      if (thisInstance.users[socket.id].ingame && thisInstance.games[thisInstance.users[socket.id].gameID].gameType == gamesTypes[0]) {
          if (thisInstance.users[socket.id].gameData.token == "circle") {
              thisInstance.games[thisInstance.users[socket.id].gameID].game.end("cross");
          } else {
              thisInstance.games[thisInstance.users[socket.id].gameID].game.end("circle");
          }
      }
      delete thisInstance.users[socket.id];
    });
    
}


function Init(io) {
    this.io = io;
    this.queue = [];
    this.games = {};
    this.users = {};
    this.currentGame = 0;
    var thisInstance = this;
    this.io.on("connection", function(socket)
    {
        thisInstance.socketHandler(socket);
    });
}

Init.prototype.preStartMathGame = function(players, preparedGame, gameid, privateGame) {
    
};

Init.prototype.preStartttt = function(players, preparedGame, gameId, privateGame) {
    var thisInstance = this;
    preparedGame.game = new ttt.Game(players[0], function(winner) {
        var preparedEmitEnd = {};
        preparedEmitEnd.winner = winner;
        thisInstance.io.to("game" + gameId).emit("endGame", preparedEmitEnd);
        for (i = 0; i < thisInstance.games[gameId].players.length; i++) {
            var thisPlayerId = thisInstance.games[gameId].players[i].id;
            thisInstance.users[thisPlayerId].ingame = false;
            thisInstance.users[thisPlayerId].gameID = null;
            thisInstance.users[thisPlayerId].gameData = {};
        }
        delete thisInstance.games[gameId];
    });
    this.users[players[0].id].gameData.token = "cross";
    if (privateGame) {
        preparedGame.status = "open";
        var preparedRes = {};
        preparedRes.gameId = gameId;
        preparedRes.status = "success";
        preparedRes.message = "game created";
        players[0].emit("privateGameResponse", preparedRes);
    } else {
        preparedGame.game.startGame(players[1]);
        this.users[players[1].id].gameData.token = "circle";
        for (i = 0; i < players.length; i++) {
            var preparedEmitStart = {};
            if (i == 0) {
                preparedEmitStart.opponentNickname = this.users[players[1].id].nickname;
            } else {
                preparedEmitStart.opponentNickname = this.users[players[0].id].nickname;
            }
            preparedEmitStart.token = this.users[players[i].id].gameData.token;
            preparedEmitStart.gameId = gameId;
            thisInstance.io.to(players[i].id).emit("start", preparedEmitStart);
        }
    }
};

/*
var questions = require('./questions.js');

var players = [];
var games = [];

exports.QueueUp = function(socket)
{
  console.log("Player Queued");
  players.push(socket);

  if (CheckForGame())
  {
    var randomId = CreateGameId();
    CreateRoom(players[0], players[1], randomId);
  }

}

function CheckForGame(callback)
{
  if (players.length < 2)
  {
    return false;
  }
  else
  {
    return true;
  }
}

function CreateGameId()
{
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
  {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
}

function fetchcategories()
{
  var categories = questions.getCategories();
  return categories[Math.floor(Math.random() * categories.length)];
}

function fetchGames()
{
  var fetchedCategories = fetchcategories();

  var questions = [];

  for (var i = 0; i < 2; i++)
  {
    if (i == 0)
    {
      questions.push(fetchedCategories[Math.floor(Math.random() * fetchedCategories.length)]);
    }

    for (var j = 0; j < questions.length; j++)
    {
      if (questions[j].id == fetchedCategories[Math.floor(Math.random() * fetchedCategories.length)])
      {
        questions.push(fetchedCategories[Math.floor(Math.random() * fetchedCategories.length)]);
      }
    }
  }
}

function CreateGame(gameid, player1Socket, player2Socket)
{
  var gameQuestions = fetchGames();
  var obj = {id: gameid, player1: player1Socket, player2: player2Socket, games: gameQuestions };
  games.push(obj);
}

function CreateRoom(player1, player2, gameId)
{
  player1.join(gameId);
  player2.join(gameId);
  CreateGame(gameId, player1, player2);
}*/
module.exports.Init = Init;
