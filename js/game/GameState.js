
import Player from './Player.js';
import { LOCATIONS, JOBS } from './gameData.js';

class GameState {

    workShift() {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Employment Agency') {
            return { success: false, message: 'Must be at the Employment Agency to work.' };
        }

        const availableJobs = JOBS.filter(job => job.educationRequired <= currentPlayer.educationLevel);
        if (availableJobs.length === 0) {
            return { success: false, message: 'No jobs available for your education level.' };
        }

        // Find the highest paying job available for the player's education level
        const bestJob = availableJobs.reduce((prev, current) => (prev.wage > current.wage) ? prev : current);

        if (currentPlayer.time < bestJob.shiftHours) {
            return { success: false, message: `Not enough time to work the ${bestJob.title} shift.` };
        }

        currentPlayer.addCash(bestJob.wage * bestJob.shiftHours);
        currentPlayer.updateTime(-bestJob.shiftHours);
        currentPlayer.advanceCareer();
        return { success: true, message: `Worked as a ${bestJob.title} and earned $${bestJob.wage * bestJob.shiftHours}.` };
    }

    travelTo(destination) {
        if (!LOCATIONS.includes(destination)) {
            throw new Error(`Invalid destination: ${destination}`);
        }

        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location === destination) {
            return { success: true, message: 'Already at this location.' };
        }

        const travelTime = currentPlayer.hasCar ? 1 : 2;

        if (currentPlayer.time < travelTime) {
            return { success: false, message: 'Not enough time for the trip.' };
        }

        currentPlayer.updateTime(-travelTime);
        currentPlayer.setLocation(destination);
        return { success: true, message: `Traveled to ${destination}.` };
    }

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
