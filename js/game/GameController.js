import GameState from './GameState.js';

class GameController {
    constructor(numberOfPlayers, aiController = null, updateUICallback = () => { }) {
        this.gameState = new GameState(numberOfPlayers, aiController !== null);
        this.aiController = aiController;
        this.updateUICallback = updateUICallback;
        this.gameOver = false;
        this.winner = null;
    }

    async handleAction(actionType, params) {
        if (this.gameOver) {
            return { success: false, message: "Game is over." };
        }

        const currentPlayer = this.gameState.getCurrentPlayer();
        let result = { success: false, message: "Unknown action." };

        switch (actionType) {
            case 'travel':
                result = this.gameState.travelTo(params.destination);
                break;
            case 'workShift':
                result = this.gameState.workShift();
                break;
            case 'takeCourse':
                result = this.gameState.takeCourse(params.courseId);
                break;
            case 'buyItem':
                result = this.gameState.buyItem(params.itemName);
                break;
            case 'deposit':
                result = this.gameState.deposit(params.amount);
                break;
            case 'withdraw':
                result = this.gameState.withdraw(params.amount);
                break;
            case 'takeLoan':
                result = this.gameState.takeLoan(params.amount);
                break;
            case 'repayLoan':
                result = this.gameState.repayLoan(params.amount);
                break;
            case 'buyCar':
                result = this.gameState.buyCar();
                break;
            case 'endTurn':
                this.gameState.endTurn();
                result = { success: true, message: "Turn ended." };
                break;
            default:
                result = { success: false, message: `Invalid action type: ${actionType}` };
        }

        if (result.success) {
            this.gameState.addLogMessage(result.message);
            if (actionType !== 'endTurn' && this.gameState.checkWinCondition(currentPlayer)) {
                this.gameOver = true;
                this.winner = currentPlayer;
                const winMessage = `${result.message} ${currentPlayer.name} has won the game!`;
                this.gameState.addLogMessage(winMessage);
                result.message = winMessage;
            }
        }

        if (actionType === 'endTurn' && !this.gameOver) {
            this.updateUICallback(); // Update UI to show player switch
            if (this.gameState.getCurrentPlayer().isAI) {
                await this.handleAITurn();
            }
        }

        return result;
    }

    async handleAITurn() {
        const AI_THINKING_DELAY = 500; // milliseconds
        let aiPlayer = this.gameState.getCurrentPlayer();

        while (aiPlayer.isAI && aiPlayer.time > 0 && !this.gameOver) {
            await new Promise(resolve => setTimeout(resolve, AI_THINKING_DELAY));

            const aiAction = this.aiController.takeTurn(this.gameState, aiPlayer);

            if (aiAction.action === 'endTurn') {
                this.handleAction('endTurn', {});
                break; // AI decided to end turn
            }

            const result = await this.handleAction(aiAction.action, aiAction.params);
            this.updateUICallback();

            if (!result.success) {
                // If AI's action failed, it might be stuck, so end its turn
                this.handleAction('endTurn', {});
                break;
            }

            // Re-check if the current player is still the AI after the action
            aiPlayer = this.gameState.getCurrentPlayer();
        }
        this.updateUICallback(); // Final UI update after AI turn is completely over
    }

    getNextAvailableCourse() {
        return this.gameState.getNextAvailableCourse();
    }
}

export default GameController;
