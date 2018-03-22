
function MathGame(player0, player1, questionLength, callback){
	this.player0 = new MathGamePlayer(player0);
	this.player1 = new MathGamePlayer(player1);
	this.players = [this.player0, this.player1];
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
		if (typeof this.callback == "function") {
			this.callback();
		}	
	}
}


function MathGamePlayer(name) {
	//constructor
	this.name = name;
	this.progress = 0;
}

MathGamePlayer.prototype.addProgress = function() {
	this.progress++;
};

module.exports.MathGame = MathGame; 