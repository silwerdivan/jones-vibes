
import Player from './Player.js';
import { LOCATIONS, JOBS, COURSES, SHOPPING_ITEMS } from './gameData.js';

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
        currentPlayer.deductTime(jobToWork.shiftHours);

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
        currentPlayer.deductTime(course.time);
        currentPlayer.advanceEducation(); // This will set educationLevel to course.educationMilestone

        return { success: true, message: `Successfully completed ${course.name}! Your education level is now ${currentPlayer.educationLevel}.` };
    }

    buyItem(itemName) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Shopping Mall') {
            return { success: false, message: 'Must be at the Shopping Mall to buy items.' };
        }

        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (!item) {
            return { success: false, message: 'Item not found.' };
        }

        if (currentPlayer.cash < item.cost) {
            return { success: false, message: `Not enough cash to buy ${item.name}. You need $${item.cost}.` };
        }

        currentPlayer.spendCash(item.cost);
        currentPlayer.updateHappiness(item.happinessBoost);

        return { success: true, message: `Successfully bought ${item.name}! Your happiness increased by ${item.happinessBoost}.` };
    }

    deposit(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            return { success: false, message: 'Must be at the Bank to deposit cash.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Deposit amount must be positive.' };
        }

        if (currentPlayer.deposit(amount)) {
            return { success: true, message: `Successfully deposited $${amount}.` };
        } else {
            return { success: false, message: 'Not enough cash to deposit.' };
        }
    }

    withdraw(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            return { success: false, message: 'Must be at the Bank to withdraw cash.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Withdrawal amount must be positive.' };
        }

        if (currentPlayer.withdraw(amount)) {
            return { success: true, message: `Successfully withdrew $${amount}.` };
        } else {
            return { success: false, message: 'Not enough savings to withdraw.' };
        }
    }

    takeLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Bank') {
            return { success: false, message: 'Must be at the Bank to take a loan.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Loan amount must be positive.' };
        }

        if (currentPlayer.loan + amount > MAX_LOAN) {
            return { success: false, message: `Cannot take a loan exceeding the $${MAX_LOAN} cap. Current loan: $${currentPlayer.loan}.` };
        }

        currentPlayer.takeLoan(amount);
        currentPlayer.addCash(amount);
        return { success: true, message: `Successfully took a loan of $${amount}. Total loan: $${currentPlayer.loan}.` };
    }

    repayLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            return { success: false, message: 'Must be at the Bank to repay a loan.' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Repayment amount must be positive.' };
        }

        if (currentPlayer.cash < amount) {
            return { success: false, message: 'Not enough cash to repay this amount.' };
        }

        if (amount > currentPlayer.loan) {
            return { success: false, message: `Repayment amount ($${amount}) cannot exceed outstanding loan ($${currentPlayer.loan}).` };
        }

        currentPlayer.spendCash(amount);
        currentPlayer.repayLoan(amount);
        return { success: true, message: `Successfully repaid $${amount}. Remaining loan: $${currentPlayer.loan}.` };
    }

    buyCar() {
        const currentPlayer = this.getCurrentPlayer();
        const CAR_COST = 3000;

        if (currentPlayer.location !== 'Used Car Lot') {
            return { success: false, message: 'Must be at the Used Car Lot to buy a car.' };
        }

        if (currentPlayer.hasCar) {
            return { success: false, message: 'You already own a car.' };
        }

        if (currentPlayer.cash < CAR_COST) {
            return { success: false, message: `Not enough cash to buy a car. You need $${CAR_COST}.` };
        }

        currentPlayer.spendCash(CAR_COST);
        currentPlayer.giveCar();
        return { success: true, message: 'Congratulations! You bought a car.' };
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

        currentPlayer.deductTime(travelTime);
        currentPlayer.setLocation(destination);
        return { success: true, message: `Traveled to ${destination}.` };
    }

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
        // Reset the player's time to 24.
        currentPlayer.setTime(24);

        // Reset Location to Home:
        currentPlayer.setLocation('Home');

        // Finally, advance to the next player.
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        // If all players have taken their turn, increment the turn counter
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
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
}

export default GameState;
