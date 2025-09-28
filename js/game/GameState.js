
import Player from './Player.js';
import { LOCATIONS, JOBS, COURSES } from './gameData.js';

class GameState {

    _getAvailableJobs(player) {
        return JOBS.filter(job => player.educationLevel >= job.educationRequired);
    }

    workShift() {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Employment Agency') {
            return { success: false, message: 'Must be at the Employment Agency to work.' };
        }

        const availableJobs = this._getAvailableJobs(currentPlayer);
        if (availableJobs.length === 0) {
            return { success: false, message: 'No jobs available for your education level.' };
        }

        // Find the highest-level job from the available list
        const jobToWork = availableJobs.reduce((prev, current) => (prev.level > current.level) ? prev : current);

        if (currentPlayer.time < jobToWork.shiftHours) {
            return { success: false, message: `Not enough time to work the ${jobToWork.title} shift.` };
        }

        // Deduct the shiftHours from the player's time.
        currentPlayer.updateTime(-jobToWork.shiftHours);

        // Calculate earnings and add to cash.
        const earnings = jobToWork.wage * jobToWork.shiftHours;
        currentPlayer.addCash(earnings);

        // Update the player's careerLevel to jobToWork.level if it's an advancement.
        if (jobToWork.level > currentPlayer.careerLevel) {
            currentPlayer.careerLevel = jobToWork.level;
        }

        return { success: true, message: `Worked as a ${jobToWork.title} and earned $${earnings}.`, job: jobToWork };
    }

    takeCourse(courseId) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Community College') {
            return { success: false, message: 'Must be at the Community College to take a course.' };
        }

        const course = COURSES.find(c => c.id === courseId);

        if (!course) {
            return { success: false, message: 'Course not found.' };
        }

        if (currentPlayer.educationLevel >= course.educationMilestone) {
            return { success: false, message: `You have already completed ${course.name} or a higher level course.` };
        }

        if (course.educationMilestone !== currentPlayer.educationLevel + 1) {
            return { success: false, message: `You must take courses in sequential order. Next course is for education level ${currentPlayer.educationLevel + 1}.` };
        }

        if (currentPlayer.cash < course.cost) {
            return { success: false, message: `Not enough cash to take ${course.name}. You need $${course.cost}.` };
        }

        if (currentPlayer.time < course.time) {
            return { success: false, message: `Not enough time to take ${course.name}. You need ${course.time} hours.` };
        }

        currentPlayer.spendCash(course.cost);
        currentPlayer.updateTime(-course.time);
        currentPlayer.advanceEducation(); // This will set educationLevel to course.educationMilestone

        return { success: true, message: `Successfully completed ${course.name}! Your education level is now ${currentPlayer.educationLevel}.` };
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
