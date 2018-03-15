
var c;
var ctx;
var socket;
var currentGame;
var findingGame = false;
var ingame = false;
var canvasSize;

$(function ()
{
	socket = io();

});


var mgr;

function setup() {
	//p5 function
	console.log("henlo world!");
	c = createCanvas(1920*0.6,1080*0.6);
	
	

	$(c.canvas.id).appendTo("#canvasContainer");
	mgr = new SceneManager();

	mgr.addScene(MainMenu);
	mgr.addScene(GameScene);

	mgr.showNextScene();

}

function draw() {
	//p5 function
	mgr.draw();
}

function mousePressed() {
	//p5 function
	mgr.scene.oScene.mousePress();
}


function getSize(scale, direction){
	if (direction == 0) {
		return scale * width;
	} else {
		return scale * height;
	}
}


function MainMenu() {
	this.setup = function(){
		this.findingMatch = false;
		this.bg = loadImage("img/MånebyLockedandLoadedExpandedVersion.png");
		this.queueBut = loadImage("img/Queue.png");
		//create click regions
		this.findMatchRegion = new Region(getSize(0.7, 0), getSize(0.75, 1), getSize(0.2, 0), getSize(0.175, 1));
		this.findMatchRegion.onclick = function () {
			findGame();
		}
		this.cancelMatchRegion = new Region(getSize(0.7, 0), getSize(0.75, 1), getSize(0.2, 0), getSize(0.175, 1));
		this.cancelMatchRegion.onClick = function () {
			
		}

		this._mouseHandler = new MouseHandler();
		this._mouseHandler.addRegion(this.findMatchRegion);

		



	}



	this.draw = function() {
		//background
		background(this.bg);
		

		//queue for match button else cancel box
		//box
		push();
		var r = this.findMatchRegion;
		if (!this.findingMatch) {
			r.isInside() ? fill(28, 101, 219) : fill(0, 128, 43);
			rect(r.x, r.y, r.w, r.h, 20);
			pop();
			push();
			textSize(getSize(0.05, 1));
			text("Find Match", getSize(0.735, 0), getSize(0.85, 1));
		}else {
			r.isInside() ? fill(219, 206, 28) : fill(219, 37, 28);
			rect(r.x, r.y, r.w, r.h, 20);
			pop();
			push();
			textSize(getSize(0.05, 1));
			text("Cancel", getSize(0.735, 0), getSize(0.85, 1));
		}
		
		pop();
		//text

	}
}

MainMenu.prototype.mousePress = function () {
	this._mouseHandler.onClick(mouseX, mouseY);
}








function changeCanvasPosition()
{
  c.canvas.style.marginRight = ((window.width/2) - (c.canvas.width/2)) + "px";
  c.canvas.style.marginTop = ((window.height/2) - (c.canvas.height/2)) + "px";
}


function cancelGame() {
	//sends to the serber a request to cancel the game
	socket.emit("cancelFindMatch");
}

function onCancelMatchResponse(data) {
	/*data is an object that has:
	status: Boolean (true if the player is no longer in a queue)
	//*/

	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}

	if (d1.status) {
		var tScene = mgr.scene.oScene
		//in queue
		tScene.findingMatch = false;
		//change region from find match to cancel search
		tScene._mouseHandler.removeRegion(tScene.cancelMatchRegion.id);
		tScene._mouseHandler.addRegion(tScene.findMatchRegion);

	}

}



function findGame() {
	//console.log("sending request for finding a game");
	//sends a request to find a game
	socket.emit("findMathGame");
}

function onFindMatchResponse(data) {
	/*data is an object that has:
	status: Boolean (true if the player is now in a queue)
	//*/
	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}

	if (d1.status) {
		var tScene = mgr.scene.oScene
		//in queue
		tScene.findingMatch = true;
		//change region from find match to cancel search
		tScene._mouseHandler.removeRegion(tScene.findMatchRegion.id);
		tScene._mouseHandler.addRegion(tScene.cancelMatchRegion);

	}

}

function checkData(data) {
	if (typeof data == "undefined") {
		console.log("data is undefined");
		return false;
	} else if (typeof data == "string") {
		try {
			data = JSON.parse(data);
		} catch(e){
			console.log("couldn't parse data from response", e);
			return false;
		}
	}

	if (typeof data != "object") {
		console.log("response is not an object", data);
		return false;
	}

	return data;

}


function onGameFound(data) {
	//data should be a JSON object containing:
	//questions: an array of question objects
	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}
	
	if (typeof d1.questions != "object") {
		console.log("foundgame response .queations is not an array");
	}

	currentGame = new Game(d1.questions);
	//change scene to Game

}

function sendChallenge(friendId) {
	socket.emit("challenge", {friendId: friendId});
}

function onChallengeRecieved(data) {
	// body...
}

function onChallengeResponse(data) {
	//data should be an object with an accepted key as a boolean of the other payer accepted  
}

function onConnectAndGame(){
	//box on screen
}



function GameScene() {
	this.setup = function(){

		//get background image
		this.bg = loadImage("img/Battleground.png");
		//get building images
		var mb = "img/Moonbygning";
		this.buildings = [
			loadImage(mb + "Blue.png"),
			loadImage(mb + "Green.png"),
			loadImage(mb + "Orange.png"),
			loadImage(mb + "Purple.png"),
			loadImage(mb + "Red.png")
		];

		//set game object
		this.game = new MathGame();
		this.isGameReady = true;

		//instantiate input
		this.ci = new CanvasInput({
			canvas: document.getElementById(c.canvas.id)
		});

	}

	this.draw = function(){
		//draw background
		background(this.bg);
		
		

		//show the input if the game is running
		if (this.gameRunning) {
			this.ci.render();
			//draw question
		}
		
	}

}

GameScene.prototype.mousePress = function () {
	this._mouseHandler.onClick(mouseX, mouseY);
}



function MathGame(){
	this.player0 = new MathGamePlayer();
	this.player1 = new MathGamePlayer();
	this.players = [player0, player1];
	this.questionLength = questionLength;
	this.callback = callback;
}

MathGame.prototype.setPlayerName = function(playerInt, name) {
	this.players[playerInt].name = name;

};

MathGame.prototype.addProgress = function (playerInt) {
	this.players[playerInt].addProgress();
	if (this.players[playerInt].progress == this.questionLength) {
		//this player has won!
		//end the game by telling who won the game

		//start winner animation

		//run callback function
		if (typeof this.callback == "function") {
			this.callback();
		}
		
	}
}

function onGameData(data) {
	/* data should be an object that contains:
	gameData: object:
		key for each of the 
	//*/

	var ti = setInterval(()=>{
		if (mgr.scene.oScene.isGameReady) {
			clearInterval(ti);
			var d1 = checkData();
			if (d1 != false) {
				Object.keys(d1.gameData).forEach(key => {
					mgr.scene.oScene.game[key] = d1.gameData[key];
				})
			}
			
		}
	}, 500)



}



function MathGamePlayer(playerName) {
	this.name = playerName;
	this.progress = 0;
}

MathGamePlayer.prototype.addProgress = function() {
	this.progress++;
};





function Region(x,y,width, height) {
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
}

Region.prototype.isInside = function() {
	//check the position of the mouse relative to the region.
	if (this.x > mouseX) {
		return false;
	}
	if ((this.x + this.w) < mouseX ) {
		return false;
	}
	if (this.y > mouseY) {
		return false;
	}
	if ((this.y + this.h) < mouseY ) {
		return false;
	}
	//returns true if the mouse is inside
	return true;
}





function MouseHandler() {
	this.regions = [];
	this.rID = 0
}

MouseHandler.prototype.addRegion = function(region) {
	if (typeof region.id == "undefined") {
		var regionId = this.getNewRID;
		region.id = regionId;
	}
	
	this.regions.push(region);
	return region;
};

MouseHandler.prototype.getNewRID = function(){
	this.rID++;
	return this.rID - 1;
}

MouseHandler.prototype.removeRegion = function(id) {
	//finding region with that id
	for (var i = this.regions.length - 1; i >= 0; i--) {
		if(this.regions[i].id == id){
			this.regions.splice(i,1);
			break;
		}
	}
};

MouseHandler.prototype.onClick = function(x,y) {
	//check all regions if the click was inside one of them
	for (var i = this.regions.length - 1; i >= 0; i--) {
		if (typeof this.regions[i].onclick == "function") {
			if (this.regions[i].isInside()) {
				this.regions[i].onclick();
			}
		}
	}
};

