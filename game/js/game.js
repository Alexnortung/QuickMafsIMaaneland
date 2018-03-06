
var c;
var ctx;
var socket;
var currentGame;
var findingGame = false;
var ingame = false;

$(function ()
{
    socket = io();


  });


var mgr;

function setup() {
	var c = createCanvas(600,500);

	$(c.elt.id).appendTo("#canvasContainer");
	mgr = new SceneManager();

	mgr.addScene(MainMenu);

	mgr.showNextScene();

}

function draw() {
	mgr.draw();
}



function MainMenu() {
	this.setup = function(){



	}

	this.draw = function() {
		//background
		background(50);

		//queue for match button
		//rect

		//text
	}


	

}



function changeCanvasPosition()
{
  c.style.marginRight = ((window.width/2) - (c.width/2)) + "px";
  c.style.marginTop = ((window.height/2) - (c.height/2)) + "px";
}



function findGame() {
	socket.emit("findMathGame");
}

function onGameFound(data) {
	//data should be a JSON object containing:
	//questions: an array of question objects

	if (typeof data == "undefined") {
		console.log("data is undefined");
		return;
	} else if (typeof data == "string") {
		try {
			data = JSON.parse(data);
		} catch(e){
			console.log("couldn't parse data on foundgame response");
			return;
		}
	}

	if (typeof data != "object") {
		console.log("foundgame response is not an object", data);
		return;
	}
	if (typeof data.questions != "object") {
		console.log("foundgame response .queations is not an array");
	}

	currentGame = new Game(data.questions);
	//change scene to Game


}

function sendChallenge(friendId) {
	socket.emit("challenge", {friendId: friendId});
}

function onChallengeResponse(data) {
	//data should be an object with an accepted key as a boolean of the other payer accepted  
}








function Game(questions){
	this.questions = questions;
}

Game.prototype.getGameState = function() {
	//emit to the server that the client needs current gamestate
};



