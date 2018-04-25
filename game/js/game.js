
var c;
var ctx;
var socket;
var currentGame;
var findingGame = false;
var ingame = false;
var canvasSize = {w: 1920, h: 1080};
var playersOnlineNumber = 1;
var myNickname = "";

$(function ()
{

	socket = io();
	//set socket listeners

	socket.on("cancelMatch", onCancelMatchResponse);
	socket.on("findMatch", onFindMatchResponse);
	socket.on("gameFound", onGameFound);
	socket.on("progress", onAddprogress);
	socket.on("question", onQuestionRecieved);
	socket.on("answer", onAnswerRecieved);
	socket.on("playerOnline", onPlayersOnline);
	socket.on("changeNickname", onNicknameChange);


});


var mgr;

function setup() {
	c = createCanvas(1920*0.6,1080*0.6);



	$(c.canvas.id).appendTo("#canvasContainer");

	//instantiating scenemanager
	mgr = new SceneManager();

	//adding scenes to scene manager
	mgr.addScene(MainMenu);
	mgr.addScene(GameScene);

	//show the first scene
	mgr.showNextScene();

	windowResized();

}

function draw() {
	//p5 function
	mgr.draw();
}


function windowResized() {
	//console.log("resizing canvas");
	//this is a p5 function
	//resize the canvas
	//ideal dimensions of the canvas
	var dimensions = {width: 1920, height: 1080};

	//calculate the new dimensions of the canvas
	var newDimensions = ResizeImage(dimensions.width, dimensions.height, windowWidth, windowHeight);

	//resize the canvas
	resizeCanvas(newDimensions.width, newDimensions.height);

	var tScene = mgr.scene.oScene;
	if (typeof tScene.windowResized == "function") {
		tScene.windowResized();
	}

}


function mousePressed() {
	//p5 function
	mgr.scene.oScene.mousePress();
}


function getSize(percent, direction){
	if (direction == 0) {
		//width of the canvas from p5
		return percent * width;
	} else {
		//height of the canvas from p5
		return percent * height;
	}
}


function MainMenu() {

	this.createNameInput = function() {
		var ciWidth = 250/1920;
		this.nameInput = new CanvasInput({
			canvas: document.getElementById(c.canvas.id),
			x: getSize(0.5 - 0.5*ciWidth, 0),
			width: getSize(ciWidth, 0),
			y: getSize(0.8, 1),
			onsubmit: function(){
				
				changeNickname(this.value());
				console.log(this.value());
				this.value("");
			}
		});
	}

	this.setup = function(){

		this.createNameInput();		

		

		this.findingMatch = false;
		this.bg = loadImage("img/MånebyLockedandLoadedExpandedVersion.png");
		this.queueBut = loadImage("img/Queue.png");
		//create click regions
		this.findMatchRegion = new Region(0.7, 0.75 , 0.2 , 0.175 );
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
			rect(getSize(r.x, 0), getSize(r.y, 1), getSize(r.w, 0), getSize(r.h,1), 20);
			pop();
			push();
			textSize(getSize(0.05, 1));
			text("Find Match", getSize(0.735, 0), getSize(0.85, 1));
		}else {
			r.isInside() ? fill(219, 206, 28) : fill(219, 37, 28);
			rect(getSize(r.x, 0), getSize(r.y, 1), getSize(r.w, 0), getSize(r.h,1), 20);
			pop();
			push();
			textSize(getSize(0.05, 1));
			text("Cancel", getSize(0.735, 0), getSize(0.85, 1));
		}

		pop();
		

		//draw how many players are online
		push();
		fill(255);
		textAlign(LEFT, TOP);
		textSize(getSize(24/1920, 0));
		text("players online: " + playersOnlineNumber, getSize(0.015, 0), getSize(0.01, 1));
		pop();


		

		this.nameInput.render();


	}
}

MainMenu.prototype.windowResized = function() {
	this.createNameInput();
}

MainMenu.prototype.mousePress = function () {
	
	this._mouseHandler.onClick(mouseX, mouseY);
}




function onPlayersOnline(data) {
	playersOnlineNumber = data;
	//console.log(data);
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


function changeNickname(nickname){
	socket.emit("changeNickname", nickname);
}


function onNicknameChange(data){
	myNickname = data;
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
	console.log(data);
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
	//player0: string
	//player1: string
	//questionLength: number
	console.log(data);
	var d1 = checkData(data);
	if (d1 == false) {
		return;
	}

	currentGame = new MathGame(d1.player0, d1.player1, d1.questionLength, (playerInt) => {
		//callback, fires when there has been found a winner
		var tScene = mgr.scene.oScene
		
		tScene.winner = currentGame.players[playerInt];
		tScene.endGame = true;
	});
	//change scene to Game
	var promise = new Promise((resolve, reject) => {
		mgr.showScene(GameScene, {game: currentGame, resolve: resolve});
	}).then(() => socket.emit("startedGame"));

	
	


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

		this.game = this.sceneArgs.game;
		this.winner = null;
		this.tick = 0;
		this.endGameTick = 0;
		this.isGameReady = true;
		this.gameRunning = true;
		this.endGame = false;

		this._mouseHandler = new MouseHandler();
		this.questionHolder = new QuestionHolder();
		var thisInsatnce = this;

		//instantiate input
		var ciWidth = 250/1920;
		this.ci = new CanvasInput({
			canvas: document.getElementById(c.canvas.id),
			x: getSize(0.5 - 0.5*ciWidth, 0),
			width: getSize(ciWidth, 0),
			y: getSize(0.8, 1),
			onsubmit: function(){
				answerQuestion(this.value(), thisInsatnce.questionHolder.getCurrentQuestion().id);
				this.value("");
			}
		});

		//instantiate regions for showing questions
		this.questionRegions = [];
		var thisInsatnce = this;
		var regionTextSize = 82;
		for (var i = 0; i < this.game.questionLength; i++) {
			var r = new Region(
				0.2  + (i * 180/1920) , 0.05,
				regionTextSize/1920, regionTextSize/1920, {i: i, textSize: regionTextSize}
			);

			r.onclick = function () {
				//var i2 = JSON.parse(JSON.stringify(i))

				//console.log(this.extras.i);
				if (typeof thisInsatnce.questionHolder.questions[this.extras.i] != "undefined") {
					thisInsatnce.questionHolder.showQuestion(this.extras.i);
				}
			}

			this.questionRegions.push(r);
			this._mouseHandler.addRegion(r);
		}

		if (typeof this.sceneArgs.resolve == "function") {
			this.sceneArgs.resolve();
		}

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

		for (var i = 0; i < this.game.player1.progress; i++) {
			//Draw building relative to its i;
			if (i < this.buildings.length) {
				image(this.buildings[i], getSize(0.91 - 0.08 * i, 0), getSize(0.9, 1), getSize(0.08, 0), getSize(0.08, 1), 0,0);
			}

		}



		if (this.gameRunning) {
			var thisQuestion = this.questionHolder.getCurrentQuestion();
			//draw question
			if (typeof thisQuestion != "undefined") {
				push();
				imageMode(CENTER);

				//console.log(thisQuestion);

				if (typeof thisQuestion !== "undefined" && typeof thisQuestion.imgSize !== "undefined") {
					image(thisQuestion.img, getSize(0.5, 0), getSize(0.45, 1), getSize(thisQuestion.imgSize.width/1920,0), getSize(thisQuestion.imgSize.height/1920,0));
				}

				
				pop();
			}



			if (typeof thisQuestion != "undefined" ) {
				//draw input if the question is not answered
				!thisQuestion.isAnswered ? this.ci.render() : void(0);


			}

			//draw answer

			if (typeof thisQuestion != "undefined") {

				push();
				var txtSize = 48;
				textSize(getSize(txtSize/1920, 0));
				if (thisQuestion.answer != null) {
					text("det rigtige svar er: " + thisQuestion.answer, getSize(0.1,0), getSize(0.8, 1));
				}

				if (thisQuestion.userAnswer != null) {
					//console.log(1232);
					text("du svarede: " + thisQuestion.userAnswer, getSize(0.1,0), getSize(0.8, 1) + getSize((txtSize+4)/1920, 0));
				}
				pop();
			}
		}

		//draw numbers to switch betweeen questions
		for (var i = 0; i < this.questionRegions.length; i++) {
			var qr = this.questionRegions[i];
			push();

			if (typeof this.questionHolder.questions[i] == "undefined") {
				fill(100);
			} else if(this.questionHolder.showingQuestion == i) {
				fill(0, 255, 0);
			} else {
				fill(255, 255, 0);
			}
			textAlign(LEFT, TOP);
			textSize(getSize(qr.extras.textSize/1920,0));
			var extra = getSize(4/1920,0);
			text(i, getSize(qr.x,0) + extra, getSize(qr.y,1)+ extra);

			pop();

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





function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
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

	mgr.scene.oScene.game.addProgress(d1.playerInt, d1.correct);
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
	var imgPath = "img/questions/" + d1.img

	//instantiate the question
	var q = new Question(imgPath, d1.qId);

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
	console.log(answer, qId);
	//set the user answer on a question to the answer
	mgr.scene.oScene.questionHolder.setUserAnswer(answer, qId);

	//emit to the server what the user answered
	socket.emit("gameAction", {
		action: "answer",
		value: answer
	});
}




function QuestionHolder() {
	//constructor
	this.questions = [];
	this.showingQuestion = 0;
}

QuestionHolder.prototype.addQuestion = function(question) {
	this.questions.push(question);
	return this;
};

QuestionHolder.prototype.showQuestion = function(questionNumber) {
	this.showingQuestion = questionNumber;


	return this;
};

QuestionHolder.prototype.getCurrentQuestion = function() {
	return this.questions[this.showingQuestion];
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
};




function Question(imgPath, qId, answers) {
	//constructor
	this.id = qId;
	if (typeof answers == "undefined") {
		this.answers = 1;
	} else {
		this.answers = answers
	}
	
	var thisInsatnce = this;
	
	GetResizedImage(1000, 1000, imgPath, (sizeObj) => {
		thisInsatnce.imgSize = sizeObj;
	});
	this.img = loadImage(imgPath);
	this.answer = null;
	this.userAnswer = null;
	this.isAnswered = false;
}

Question.prototype.setUserAnswer = function(answer) {
	this.userAnswer = answer;
	this.isAnswered = true;
};

Question.prototype.setAnswer = function(answer) {
	this.answer = answer;
};





function createInput(canvas, x,y) {
	

}








function Region(x,y,width, height, extras) {
	//constuctor
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
	this.extras = extras;
}

Region.prototype.isInside = function() {
	//check the position of the mouse relative to the region.
	if (getSize(this.x, 0) > mouseX) {
		return false;
	}
	if (getSize(this.x + this.w, 0) < mouseX ) {
		return false;
	}
	if (getSize(this.y, 1) > mouseY) {
		return false;
	}
	if (getSize(this.y + this.h, 1) < mouseY ) {
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
	//console.log("user clicked at x: " + x + " y: " + y);
	for (var i = this.regions.length - 1; i >= 0; i--) {
		
		if (typeof this.regions[i].onclick == "function") {
			
			if (this.regions[i].isInside()) {
				
				//console.log("user clicked inside region: " + i);
				this.regions[i].onclick();
			}
		}
	}
};





/*
TODO:
hvor mange er ingame
hvor mange er i queue


tegn hegn
flere input felter
vis forskellige progress for wrong og right
reset main menu
*/
