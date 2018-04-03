
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}


function MathGame(player0i, player1i, questionLength, callback){
	this.player0 = new MathGamePlayer(player0i);
	this.player1 = new MathGamePlayer(player1i);
	this.players = [this.player0, this.player1];
	this.questionLength = questionLength;
	this.callback = callback;

	
}

MathGame.prototype.setPlayerName = function(playerInt, name) {
	this.players[playerInt].name = name;

};

MathGame.prototype.addProgress = function (playerInt, correct) {
	var thisPlayer = this.players[playerInt];
	thisPlayer.addProgress(correct);
	if (thisPlayer.progress == this.questionLength) {
		thisPlayer.finished = true;
		thisPlayer.timeFinished = new Date();
		if (thisPlayer.progress == thisPlayer.right) {
			//this player has won!
			//end the game by telling who won the game
			this.endGame();
		}
		if (this.isAllPlayersFinished()) {
			this.endGame();
		}			
	}
}

MathGame.prototype.isAllPlayersFinished = function() {
	for (var i = this.players.length - 1; i >= 0; i--) {
		if ( !this.players[i].finished ) {
			return false
		}
	}
	return true;
}

MathGame.prototype.findWinner = function () {
	//find player with most rights
	var mostRights = [];
	var mostRightAmount = 0;
	for (var i = this.players.length - 1; i >= 0; i--) {
		if (this.players[i].right == mostRightAmount) {
			mostRights.push(this.players[i]);
		}else if (this.players[i].right > mostRightAmount) {
			mostRights = [this.players[i]];
			mostRightAmount = this.players[i].right;
		}
	}

	//if there is only one player with most rights, then that will be the winner
	if (mostRights.length == 1) {
		return mostRights[0];
	}

	//find the player who ended the game first
	var firstFinished;
	var placeholderTime = new Date();
	addMinutes(placeholderTime, 10);
	var firstFinishedTime = placeholderTime;

	for (var i = mostRights.length - 1; i >= 0; i--) {
		var playerTime = mostRights[i].timeFinished.getTime(); 
		if (playerTime < firstFinishedTime) {
			firstFinished = mostRights[i]
			firstFinishedTime = playerTime;
		}
	}

	return firstFinished;


}

MathGame.prototype.endGame = function() {
	if (typeof this.callback == "function") {
		this.callback(this.findWinner());
	}
}


function MathGamePlayer(name) {
	//constructor
	this.name = name;
	this.progress = 0;
	this.wrong = 0;
	this.right = 0;
	this.finished = false;
	this.timeFinished = addMinutes(new Date(), 20);
	

}



MathGamePlayer.prototype.addProgress = function(correct) {
	if (correct) {
		this.right++;
	} else {
		this.wrong++;
	}
	this.progress++;
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports.MathGame = MathGame; 
} else {
	window.MathGame = MathGame;
	window.MathGamePlayer = MathGamePlayer;
}
