const Player = require('./Player');

class GameState {
    constructor(numPlayers = 1) {
        this.players = [];
        for (let i = 0; i < numPlayers; i++) {
            this.players.push(new Player(`Player ${i + 1}`));
        }
        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.DAILY_EXPENSE = 50;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.spendCash(this.DAILY_EXPENSE);
        currentPlayer.time = 24;

        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.turn++;
        }
    }
}

module.exports = GameState;
