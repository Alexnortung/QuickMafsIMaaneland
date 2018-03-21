
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
	//set socket listeners

});


var mgr;

function setup() {
	console.log("henlo world!");
	c = createCanvas(1920*0.6,1080*0.6);
	
	

	$(c.canvas.id).appendTo("#canvasContainer");

	//instantiating scenemanager
	mgr = new SceneManager();

	//adding scenes to scene manager
	mgr.addScene(MainMenu);
	mgr.addScene(GameScene);

	//show the first scene
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
	//gameData: an object with game data
	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}

	currentGame = new MathGame(d1.player0, d1.player1, d1.questionLength);
	//change scene to Game

	mgr.showScene(GameScene, currentGame);


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

		this.game = this.sceneArgs;
		this.winner = null;
		this.tick = 0;
		this.endGameTick = 0;
		this.isGameReady = true;
		this.endGame = false;

		this._mouseHandler = new MouseHandler();
		this.questionHolder = new QuestionHolder();

		//instantiate input
		this.ci = new CanvasInput({
			canvas: document.getElementById(c.canvas.id)
		});

	}

	this.draw = function(){
		//draw background
		background(this.bg);

		//draw player names
		push();
		fill(255,255,0);
		textSize(getSize(32/1920,0));
		textAlign(LEFT,TOP);
		text(this.game.player0.name, getSize(0.01,0), getSize(0.01,1));
		textAlign(RIGHT,TOP);
		text(this.game.player1.name, getSize(0.99,0), getSize(0.01,1));
		pop();


		//draw both players progress as houses
		//player0
		for (var i = 0; i < this.game.player0.progress; i++) {
			//Draw building relative to its i;
			if (i < this.buildings.length) {
				image(this.buildings[i], getSize(0.01 + 0.08 * i, 0), getSize(0.9, 1), getSize(0.08, 0), getSize(0.08, 1), 0,0);
			}
			
		}

		
		

		//show the input if the game is running
		if (this.gameRunning) {
			//draw question

			image(this.questionHolder.questions[this.questionHolder.showingQuestion].img);

			if (this.questionHolder.unAnswered == this.questionHolder.showingQuestion) {
				//draw input
				this.ci.render();
			}

			//draw answer
			

		}



		if (this.endGame) {
			//draw winner string
			push();
			textAlign(CENTER);
			textSize(getSize(64/1920, 0));
			fill(255,255,0);
			text(this.winner.name + " won the game!", getSize(0.5, 0), getSize(0.5, 1));
			pop();
			this.endGameTick++;


			if (this.endGameTick >= 600) {

				//change scene to main menu
				mgr.scene.setupExecuted = false;
				mgr.showScene(MainMenu);

				
			}
			this.endGameTick++;
		}
		this.tick++;
		
	}

}

GameScene.prototype.mousePress = function () {
	this._mouseHandler.onClick(mouseX, mouseY);
}



function MathGame(player0, player1, questionLength){
	this.player0 = new MathGamePlayer(player0);
	this.player1 = new MathGamePlayer(player1);
	this.players = [this.player0, this.player1];
	this.questionLength = questionLength;
	
}

MathGame.prototype.setPlayerName = function(playerInt, name) {
	this.players[playerInt].name = name;

};

MathGame.prototype.addProgress = function (playerInt) {
	this.players[playerInt].addProgress();
	if (this.players[playerInt].progress == this.questionLength) {
		//this player has won!
		//end the game by telling who won the game
		var tScene = mgr.scene.oScene
		
		tScene.winner = this.players[playerInt];
		tScene.endGame = true;

		
	}
}

function onGameData(data) {
	/* data should be an object that contains:
	gameData: object:
		key for each of the thing that need to be updated in the game
	//*/

	var ti = setInterval(()=>{
		if (mgr.scene.oScene.isGameReady) {
			clearInterval(ti);
			var d1 = checkData();
			if (d1 != false) {
				Object.keys(d1.gameData).forEach(key => {
					mgr.scene.oScene.game[key] = d1.gameData[key];
				});
			}
			
		}
	}, 500);
}

function onAddprogress(data) {
	/* data should be an object with:
	playerInt: integer (the player to add progress to)
	 */

	 var d1 = checkData(data);
	 if (d1 == false) {
	 	return;
	 }

	mgr.scene.oScene.game.addProgress(d1.playerInt);
}


function onQuestionRecieved(data) {
	/* data should be an object with:
	img: url to the image with the question
	qId: the unique id for the question
	*/

	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}

	//instantiate the question
	var q = new Question(d1.img, d1.qId);

	//add the question to the question holder
	mgr.scene.oScene.questionHolder.addQuestion(q);


}

function onAnswerRecieved(data) {
	/* data should be an object with:
	answer: Number 
	qId: Number (the id of the question)
	*/
	var d1 = checkData(data);
	if (d1 == false) {
		return;
	} 

	mgr.scene.oScene.questionHolder.setAnswer(d1.answer, d1.qId);
}

function answerQuestion(answer, qId){
	//set the user answer on a question to the answer
	mgr.scene.oScene.questionHolder.setUserAnswer(answer, qId);

	//emit to the server what the user answered
	socket.emit("answerQuestion", answer);
}




function QuestionHolder() {
	//constructor
	this.questions = [];
	this.showingQuestion = 0;
	this.unAnswered = 0;
}

QuestionHolder.prototype.addQuestion = function(question) {
	this.questions.push(question);
	return this;
};

QuestionHolder.prototype.showQuestion = function(questionNumber) {
	this.showingQuestion = questionNumber;
	return this;
};

QuestionHolder.prototype.getQuestion = function(id) {
	for (var i = this.questions.length - 1; i >= 0; i--) {
		if(this.questions[i].id == id){
			return this.questions[i];

		}
	}
};

QuestionHolder.prototype.setAnswer = function(answer, id) {
	this.getQuestion(id).setAnswer(answer);
};

QuestionHolder.prototype.setUserAnswer = function(answer, id) {
	this.getQuestion(id).setUserAnswer(answer);
	this.unAnswered++;
};




function Question(img, qId) {
	//constructor
	this.id = qId;
	this.img = loadImage(img);
	this.answer = null;
	this.userAnswer = null;
	this.isAnswered = false;
}

Question.prototype.setUserAnswer = function(answer) {
	this.setUserAnswer = answer;
	this.isAnswered = true;
};

Question.prototype.setAnswer = function(answer) {
	this.answer = answer;
};



function MathGamePlayer(name) {
	//constructor
	this.name = name;
	this.progress = 0;
}

MathGamePlayer.prototype.addProgress = function() {
	this.progress++;
};






function Region(x,y,width, height) {
	//constuctor
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
	//constructor
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

