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

        if (result.success && actionType !== 'endTurn') {
            if (this.gameState.checkWinCondition(currentPlayer)) {
                this.gameOver = true;
                this.winner = currentPlayer;
                result.message = `${result.message} ${currentPlayer.name} has won the game!`;
            }
        }

        if (actionType === 'endTurn' && !this.gameOver) {
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
            this.updateUICallback(); // Update UI before AI makes a move
            await new Promise(resolve => setTimeout(resolve, AI_THINKING_DELAY));

            const aiAction = this.aiController.takeTurn(this.gameState, aiPlayer);

            if (aiAction.action === 'endTurn') {
                this.gameState.endTurn();
                break; // AI decided to end turn
            }

            const result = await this.handleAction(aiAction.action, aiAction.params);
            // Log AI's action for visibility
            this.updateUICallback(); // Update UI after AI makes a move

            if (!result.success) {
                // If AI's action failed, it might be stuck, so end its turn
                this.gameState.endTurn();
                break;
            }

            // Re-check if the current player is still the AI after the action
            aiPlayer = this.gameState.getCurrentPlayer();
        }
        this.updateUICallback(); // Final UI update after AI turn is completely over
    }
}

export default GameController;
