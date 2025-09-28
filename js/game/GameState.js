
import Player from './Player.js';

class GameState {
    constructor(numberOfPlayers) {
        if (numberOfPlayers < 1 || numberOfPlayers > 2) {
            throw new Error("Game can only be played with 1 or 2 players.");
        }

        this.players = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            this.players.push(new Player());
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

        // Deduct daily expense
        currentPlayer.spendCash(this.DAILY_EXPENSE);

        // Reset player's time to 24, not exceeding max of 48
        currentPlayer.updateTime(24 - currentPlayer.time);

        // Switch to the next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // If all players have taken their turn, increment the turn counter
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
    }
}

export default GameState;
