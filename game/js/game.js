$(function () {
    //var socket = io();

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


