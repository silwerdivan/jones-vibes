import Player from './Player.js';
import { LOCATIONS, JOBS, COURSES, SHOPPING_ITEMS } from './gameData.js';
import EventBus from '../EventBus.js';

class GameState {
    constructor(numberOfPlayers, isPlayer2AI = false) {
        if (numberOfPlayers < 1 || numberOfPlayers > 2) {
            throw new Error("Game can only be played with 1 or 2 players.");
        }

        this.players = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            const player = new Player(i + 1);
            if (i === 1 && isPlayer2AI) {
                player.isAI = true;
                player.name = "AI Opponent"; // Give AI a distinct name
            } else {
                player.isAI = false;
                player.name = `Player ${i + 1}`;
            }
            this.players.push(player);
        }

        this.currentPlayerIndex = 0;
        this.turn = 1;
        this.DAILY_EXPENSE = 50;
        this.log = [];
    }

    addLogMessage(message) {
        this.log.unshift(message); // Add to the beginning
        if (this.log.length > 50) { // Keep log from getting too big
            this.log.pop();
        }
        EventBus.publish('stateChanged', { ...this });
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();

        // Apply Interest:
        // Calculate savings interest: player.savings * 0.01 (1%). Add this to savings.
        currentPlayer.savings += currentPlayer.savings * 0.01;
        // Calculate loan interest: player.loan * 0.05 (5%). Add this to the loan balance.
        currentPlayer.loan += currentPlayer.loan * 0.05;

        // Deduct Daily Expense:
        // Deduct the DAILY_EXPENSE ($50) from the player's cash.
        currentPlayer.spendCash(this.DAILY_EXPENSE);

        // Replenish Time:
        // Add 24 hours to remaining time, capped at 48.
        let newTime = currentPlayer.time + 24;
        if (newTime > 48) {
            newTime = 48;
        }
        currentPlayer.setTime(newTime);

        // Reset Location to Home:
        currentPlayer.setLocation('Home');

        // Finally, advance to the next player.
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // If all players have taken their turn, increment the turn counter
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
        EventBus.publish('stateChanged', { ...this });
    }

    checkWinCondition(player) {
        const cashCondition = player.cash >= 10000;
        const happinessCondition = player.happiness >= 80;
        const educationCondition = player.educationLevel >= 3; // Completed Community College
        const careerCondition = player.careerLevel >= 4; // Junior Manager

        return cashCondition && happinessCondition && educationCondition && careerCondition;
    }

    getNextAvailableCourse() {
        const currentPlayer = this.getCurrentPlayer();
        return COURSES.find(course => course.educationMilestone === currentPlayer.educationLevel + 1) || null;
    }

    _getAvailableJobs(player) {
        return JOBS.filter(job => player.educationLevel >= job.educationRequired);
    }

    workShift() {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Employment Agency') {
            this.addLogMessage('Must be at the Employment Agency to work.');
            return;
        }

        const availableJobs = this._getAvailableJobs(currentPlayer);
        if (availableJobs.length === 0) {
            this.addLogMessage('No jobs available for your education level.');
            return;
        }

        // Find the highest-level job from the available list
        const jobToWork = availableJobs.reduce((prev, current) => (prev.level > current.level) ? prev : current);

        if (currentPlayer.time < jobToWork.shiftHours) {
            this.addLogMessage(`Not enough time to work the ${jobToWork.title} shift.`);
            return;
        }

        // Deduct the shiftHours from the player's time.
        currentPlayer.deductTime(jobToWork.shiftHours);

        // Calculate earnings and add to cash.
        const earnings = jobToWork.wage * jobToWork.shiftHours;
        currentPlayer.addCash(earnings);

        // Update the player's careerLevel to jobToWork.level if it's an advancement.
        if (jobToWork.level > currentPlayer.careerLevel) {
            currentPlayer.careerLevel = jobToWork.level;
        }

        this.addLogMessage(`Worked as a ${jobToWork.title} and earned $${earnings}.`);
        EventBus.publish('stateChanged', { ...this });
    }

    takeCourse(courseId) {
        const currentPlayer = this.getCurrentPlayer();
        const course = COURSES.find(c => c.id === courseId);

        if (currentPlayer.location !== 'Community College') {
            this.addLogMessage('Must be at the Community College to take a course.');
            return;
        }

        if (!course) {
            this.addLogMessage('Course not found.');
            return;
        }

        if (currentPlayer.cash < course.cost) {
            this.addLogMessage(`Not enough cash to take ${course.name}. You need $${course.cost}.`);
            return;
        }

        if (currentPlayer.time < course.time) {
            this.addLogMessage(`Not enough time to take ${course.name}. You need ${course.time} hours.`);
            return;
        }

        currentPlayer.spendCash(course.cost);
        currentPlayer.deductTime(course.time);
        currentPlayer.advanceEducation(); // This will set educationLevel to course.educationMilestone

        this.addLogMessage(`Successfully completed ${course.name}! Your education level is now ${currentPlayer.educationLevel}.`);
        EventBus.publish('stateChanged', { ...this });
    }

    buyItem(itemName) {
        const currentPlayer = this.getCurrentPlayer();
        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (currentPlayer.location !== 'Shopping Mall') {
            this.addLogMessage('Must be at the Shopping Mall to buy items.');
            return;
        }

        if (!item) {
            this.addLogMessage('Item not found.');
            return;
        }

        if (currentPlayer.cash < item.cost) {
            this.addLogMessage(`Not enough cash to buy ${item.name}. You need $${item.cost}.`);
            return;
        }

        currentPlayer.spendCash(item.cost);
        currentPlayer.updateHappiness(item.happinessBoost);

        this.addLogMessage(`Successfully bought ${item.name}! Your happiness increased by ${item.happinessBoost}.`);
        EventBus.publish('stateChanged', { ...this });
    }

    deposit(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to deposit cash.');
            return;
        }

        if (amount <= 0) {
            this.addLogMessage('Deposit amount must be positive.');
            return;
        }

        if (currentPlayer.deposit(amount)) {
            this.addLogMessage(`Successfully deposited $${amount}.`);
            EventBus.publish('stateChanged', { ...this });
        } else {
            this.addLogMessage('Not enough cash to deposit.');
        }
    }

    withdraw(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to withdraw cash.');
            return;
        }

        if (amount <= 0) {
            this.addLogMessage('Withdrawal amount must be positive.');
            return;
        }

        if (currentPlayer.withdraw(amount)) {
            this.addLogMessage(`Successfully withdrew $${amount}.`);
            EventBus.publish('stateChanged', { ...this });
        } else {
            this.addLogMessage('Not enough savings to withdraw.');
        }
    }

    takeLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to take a loan.');
            return;
        }

        if (amount <= 0) {
            this.addLogMessage('Loan amount must be positive.');
            return;
        }

        if (currentPlayer.loan + amount > MAX_LOAN) {
            this.addLogMessage(`Cannot take a loan exceeding the $${MAX_LOAN} cap. Current loan: $${currentPlayer.loan}.`);
            return;
        }

        currentPlayer.takeLoan(amount);
        currentPlayer.addCash(amount);
        this.addLogMessage(`Successfully took a loan of $${amount}. Total loan: $${currentPlayer.loan}.`);
        EventBus.publish('stateChanged', { ...this });
    }

    repayLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to repay a loan.');
            return;
        }

        if (amount <= 0) {
            this.addLogMessage('Repayment amount must be positive.');
            return;
        }

        if (currentPlayer.cash < amount) {
            this.addLogMessage('Not enough cash to repay this amount.');
            return;
        }

        if (amount > currentPlayer.loan) {
            this.addLogMessage(`Repayment amount ($${amount}) cannot exceed outstanding loan ($${currentPlayer.loan}).`);
            return;
        }

        currentPlayer.spendCash(amount);
        currentPlayer.repayLoan(amount);
        this.addLogMessage(`Successfully repaid $${amount}. Remaining loan: $${currentPlayer.loan}.`);
        EventBus.publish('stateChanged', { ...this });
    }

    buyCar() {
        const currentPlayer = this.getCurrentPlayer();
        const CAR_COST = 3000;

        if (currentPlayer.location !== 'Used Car Lot') {
            this.addLogMessage('Must be at the Used Car Lot to buy a car.');
            return;
        }

        if (currentPlayer.hasCar) {
            this.addLogMessage('You already own a car.');
            return;
        }

        if (currentPlayer.cash < CAR_COST) {
            this.addLogMessage(`Not enough cash to buy a car. You need $${CAR_COST}.`);
            return;
        }

        currentPlayer.spendCash(CAR_COST);
        currentPlayer.giveCar();
        this.addLogMessage('Congratulations! You bought a car.');
        EventBus.publish('stateChanged', { ...this });
    }

    travel(destination) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location === destination) {
            this.addLogMessage('Already at this location.');
            return;
        }

        const travelTime = currentPlayer.hasCar ? 1 : 2;

        if (currentPlayer.time < travelTime) {
            this.addLogMessage('Not enough time for the trip.');
            return;
        }

        currentPlayer.deductTime(travelTime);
        currentPlayer.setLocation(destination);
        this.addLogMessage(`Traveled to ${destination}.`);
        EventBus.publish('stateChanged', { ...this });
    }
}

export default GameState;