
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
	console.log("henlo world!");
	c = createCanvas(1920*0.6,1080*0.6);
	
	

	$(c.canvas.id).appendTo("#canvasContainer");
	mgr = new SceneManager();

	mgr.addScene(MainMenu);

	mgr.showNextScene();

}

function draw() {
	mgr.draw();
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
		this.bg = loadImage("img/MånebyLockedandLoadedExpandedVersion.png");
		this.queueBut = loadImage("img/Queue.png");



	}

	this.draw = function() {
		//background
		background(this.bg);
		

		//queue for match button
		//box
		push();
		fill(0, 128, 43);
		rect(getSize(0.7, 0), getSize(0.75, 1), getSize(0.2, 0), getSize(0.175, 1), 20);
		pop();
		
		//text
	}

}



function GameScene() {
	this.setup = function(){
		
		//set game object
		//instantiate input
		this.ci = new CanvasInput({
			canvas: document.getElementById(c.canvas.id)
		});

	}

	this.draw = function(){
		//draw background
		//draw question
		//draw input
		this.ci.render();
	}

}




function changeCanvasPosition()
{
  c.canvas.style.marginRight = ((window.width/2) - (c.canvas.width/2)) + "px";
  c.canvas.style.marginTop = ((window.height/2) - (c.canvas.height/2)) + "px";
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

function onConnectAndGame(){
	//box on screen
}






function MathGame(){

}














function Region(x,y,width, height, func) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.func = func;
}


function ClickHandler() {
	this.regions = [];
}

ClickHandler.prototype.addRegion = function(region) {
	this.regions.push(region);
};

ClickHandler.prototype.removeRegion = function() {
	// body...
};

ClickHandler.prototype.onClick = function(x,y) {
	//check all regions if the click was inside one of them
	for (var i = this.regions.length - 1; i >= 0; i--) {
		if (!this.regions[i].x < x) {
			continue;
		}
		if (!(this.regions[i].x + this.regions[i].width) > x ) {
			continue;
		}
		if (!this.regions[i].y < y) {
			continue;
		}
		if (!(this.regions[i].y + this.regions[i].height) > y ) {
			continue;
		}

		regions[i].func();

		break;
	}
};

