import Player from './Player.js';
import { JOBS, COURSES, SHOPPING_ITEMS } from './gameData.js'; // LOCATIONS is unused, can be removed
import EventBus from '../EventBus.js';
import AIController from './AIController.js'; // --- 1. IMPORT THE AI CONTROLLER

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

        this.aiController = isPlayer2AI ? new AIController() : null; // --- 2. INSTANTIATE THE AI CONTROLLER
        this.log = [];
    }

    publishCurrentState() {
        EventBus.publish('stateChanged', this);
    }

    addLogMessage(message) {
        this.log.unshift(message); // Add to the beginning
        EventBus.publish('stateChanged', this);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    endTurn() {
        const currentPlayer = this.getCurrentPlayer();
        // ... (existing interest, expense, time, and location logic) ...

        // Advance to the next player
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }
        
        // --- 3. ADD AI TURN LOGIC ---
        const nextPlayer = this.getCurrentPlayer();
        if (nextPlayer.isAI && this.aiController) {
            // Use a timeout to give the player a moment to see the state change
            setTimeout(() => {
                this.processAITurn();
            }, 1500); // 1.5 second delay
        }

        EventBus.publish('stateChanged', this);
    }

    processAITurn() {
        const currentPlayer = this.getCurrentPlayer();
        this.addLogMessage(`${currentPlayer.name} is thinking...`);
        const aiAction = this.aiController.takeTurn(this, currentPlayer);
        this.handleAIAction(aiAction);
    }

    // --- 4. NEW METHOD TO HANDLE THE AI'S CHOSEN ACTION ---
    handleAIAction(aiAction) {
        let success = false; // Declare success variable

        if (!aiAction || !aiAction.action) {
            this.endTurn(); // AI chooses to do nothing
            return;
        }

        let actionDescription = `AI decides to: ${aiAction.action}`;
        if (aiAction.params) {
            actionDescription += ` with params: ${JSON.stringify(aiAction.params)}`;
        }
        this.addLogMessage(actionDescription);

        // This switch executes the appropriate GameState method based on the AI's decision
        switch(aiAction.action) {
            case 'travel':
                success = this.travel(aiAction.params.destination);
                break;
            case 'workShift':
                success = this.workShift();
                break;
            case 'takeCourse':
                success = this.takeCourse(aiAction.params.courseId);
                break;
            case 'buyItem':
                success = this.buyItem(aiAction.params.itemName);
                break;
            case 'buyCar':
                success = this.buyCar();
                break;
            case 'deposit':
                success = this.deposit(aiAction.params.amount);
                break;
            case 'withdraw':
                success = this.withdraw(aiAction.params.amount);
                break;
            case 'takeLoan':
                success = this.takeLoan(aiAction.params.amount);
                break;
            case 'repayLoan':
                success = this.repayLoan(aiAction.params.amount);
                break;
            case 'pass':
                this.addLogMessage('AI chooses to pass its turn.');
                success = true; // Passing is always "successful" in that it ends the AI's action
                break;
            default:
                console.warn(`AI tried to perform an unknown action: ${aiAction.action}`);
                success = false;
                break;
        }

        // Centralized Post-Action Check
        if (success && this.getCurrentPlayer().time > 0) {
            this.addLogMessage("AI action successful, deciding next move...");
            setTimeout(() => this.processAITurn(), 1000);
        } else {
            if (!success) {
                this.addLogMessage("AI action failed, ending turn.");
            } else {
                this.addLogMessage("AI is out of time, ending turn.");
            }
            this.endTurn();
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

    _getAvailableJobs(player) {
        return JOBS.filter(job => player.educationLevel >= job.educationRequired);
    }

    workShift() {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Employment Agency') {
            this.addLogMessage('Must be at the Employment Agency to work.');
            return false;
        }

        const availableJobs = this._getAvailableJobs(currentPlayer);
        if (availableJobs.length === 0) {
            this.addLogMessage('No jobs available for your education level.');
            return false;
        }

        // Find the highest-level job from the available list
        const jobToWork = availableJobs.reduce((prev, current) => (prev.level > current.level) ? prev : current);

        if (currentPlayer.time < jobToWork.shiftHours) {
            this.addLogMessage(`Not enough time to work the ${jobToWork.title} shift.`);
            return false;
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
        EventBus.publish('stateChanged', this);
        return true;
    }

    takeCourse(courseId) {
        const currentPlayer = this.getCurrentPlayer();
        const course = COURSES.find(c => c.id === courseId);

        if (currentPlayer.location !== 'Community College') {
            this.addLogMessage('Must be at the Community College to take a course.');
            return false;
        }

        if (!course) {
            this.addLogMessage('Course not found.');
            return false;
        }

        if (currentPlayer.cash < course.cost) {
            this.addLogMessage(`Not enough cash to take ${course.name}. You need $${course.cost}.`);
            return false;
        }

        if (currentPlayer.time < course.time) {
            this.addLogMessage(`Not enough time to take ${course.name}. You need ${course.time} hours.`);
            return false;
        }

        currentPlayer.spendCash(course.cost);
        currentPlayer.deductTime(course.time);
        currentPlayer.advanceEducation(); // This will set educationLevel to course.educationMilestone

        this.addLogMessage(`Successfully completed ${course.name}! Your education level is now ${currentPlayer.educationLevel}.`);
        EventBus.publish('stateChanged', this);
        return true;
    }

    buyItem(itemName) {
        const currentPlayer = this.getCurrentPlayer();
        const item = SHOPPING_ITEMS.find(i => i.name === itemName);

        if (currentPlayer.location !== 'Shopping Mall') {
            this.addLogMessage('Must be at the Shopping Mall to buy items.');
            return false;
        }

        if (!item) {
            this.addLogMessage('Item not found.');
            return false;
        }

        if (currentPlayer.cash < item.cost) {
            this.addLogMessage(`Not enough cash to buy ${item.name}. You need $${item.cost}.`);
            return false;
        }

        currentPlayer.spendCash(item.cost);
        currentPlayer.updateHappiness(item.happinessBoost);

        this.addLogMessage(`Successfully bought ${item.name}! Your happiness increased by ${item.happinessBoost}.`);
        EventBus.publish('stateChanged', this);
        return true;
    }

    deposit(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to deposit cash.');
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Deposit amount must be positive.');
            return false;
        }

        if (currentPlayer.deposit(amount)) {
            this.addLogMessage(`Successfully deposited $${amount}.`);
            EventBus.publish('stateChanged', this);
            return true;
        } else {
            this.addLogMessage('Not enough cash to deposit.');
            return false;
        }
    }

    withdraw(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to withdraw cash.');
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Withdrawal amount must be positive.');
            return false;
        }

        if (currentPlayer.withdraw(amount)) {
            this.addLogMessage(`Successfully withdrew $${amount}.`);
            EventBus.publish('stateChanged', this);
            return true;
        } else {
            this.addLogMessage('Not enough savings to withdraw.');
            return false;
        }
    }

    takeLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();
        const MAX_LOAN = 2500;

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to take a loan.');
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Loan amount must be positive.');
            return false;
        }

        if (currentPlayer.loan + amount > MAX_LOAN) {
            this.addLogMessage(`Cannot take a loan exceeding the $${MAX_LOAN} cap. Current loan: $${currentPlayer.loan}.`);
            return false;
        }

        currentPlayer.takeLoan(amount);
        currentPlayer.addCash(amount);
        this.addLogMessage(`Successfully took a loan of $${amount}. Total loan: $${currentPlayer.loan}.`);
        EventBus.publish('stateChanged', this);
        return true;
    }

    repayLoan(amount) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location !== 'Bank') {
            this.addLogMessage('Must be at the Bank to repay a loan.');
            return false;
        }

        if (amount <= 0) {
            this.addLogMessage('Repayment amount must be positive.');
            return false;
        }

        if (currentPlayer.cash < amount) {
            this.addLogMessage('Not enough cash to repay this amount.');
            return false;
        }

        if (amount > currentPlayer.loan) {
            this.addLogMessage(`Repayment amount ($${amount}) cannot exceed outstanding loan ($${currentPlayer.loan}).`);
            return false;
        }

        currentPlayer.spendCash(amount);
        currentPlayer.repayLoan(amount);
        this.addLogMessage(`Successfully repaid $${amount}. Remaining loan: $${currentPlayer.loan}.`);
        EventBus.publish('stateChanged', this);
        return true;
    }

    buyCar() {
        const currentPlayer = this.getCurrentPlayer();
        const CAR_COST = 3000;

        if (currentPlayer.location !== 'Used Car Lot') {
            this.addLogMessage('Must be at the Used Car Lot to buy a car.');
            return false;
        }

        if (currentPlayer.hasCar) {
            this.addLogMessage('You already own a car.');
            return false;
        }

        if (currentPlayer.cash < CAR_COST) {
            this.addLogMessage(`Not enough cash to buy a car. You need $${CAR_COST}.`);
            return false;
        }

        currentPlayer.spendCash(CAR_COST);
        currentPlayer.giveCar();
        this.addLogMessage('Congratulations! You bought a car.');
        EventBus.publish('stateChanged', this);
        return true;
    }

    travel(destination) {
        const currentPlayer = this.getCurrentPlayer();

        if (currentPlayer.location === destination) {
            this.addLogMessage('Already at this location.');
            return false;
        }

        const travelTime = currentPlayer.hasCar ? 1 : 2;

        if (currentPlayer.time < travelTime) {
            this.addLogMessage('Not enough time for the trip.');
            return false;
        }

        currentPlayer.deductTime(travelTime);
        currentPlayer.setLocation(destination);
        this.addLogMessage(`Traveled to ${destination}.`);
        EventBus.publish('stateChanged', this);
        return true;
    }
}

export default GameState;