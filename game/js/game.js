
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
		//create click regions
		this.findMatchRegion = new Region(getSize(0.7, 0), getSize(0.75, 1), getSize(0.2, 0), getSize(0.175, 1), findGame);



	}

	this.draw = function() {
		//background
		background(this.bg);
		

		//queue for match button
		//box
		push();
		var r = this.findMatchRegion;
		r.isInside() ? fill(28, 101, 219) : fill(0, 128, 43);
		
		

		rect(r.x, r.y, r.w, r.h, 20);
		pop();
		//text
		push();
		textSize(getSize(0.05, 1));
		text("Find Match", getSize(0.735, 0), getSize(0.85, 1));
		pop();

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














function Region(x,y,width, height) {
	this.x = x;
	this.y = y;
	this.w = width;
	this.h = height;
}

Region.prototype.isInside = function() {
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
	return true;
}





function MouseHandler() {
	this.regions = [];
	this.rID = 0
}

ClickHandler.prototype.addRegion = function(region) {
	var regionId = this.getNewRID;
	region.id = regionId;
	this.regions.push(region);
	return regionId;
};

ClickHandler.prototype.getNewRID = function(){
	this.rID++;
	return this.rID - 1;
}

ClickHandler.prototype.removeRegion = function(id) {
	//finding region with that id
	for (var i = this.regions.length - 1; i >= 0; i--) {
		if(this.regions[i].id == id){
			this.regions.splice(i,1);
			break;
		}
	}
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

		

		
	}
};

