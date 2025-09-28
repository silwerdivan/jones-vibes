import GameState from './GameState.js';

class GameController {
    constructor(numberOfPlayers) {
        this.gameState = new GameState(numberOfPlayers);
        this.gameOver = false;
        this.winner = null;
    }

    handleAction(actionType, params) {
        if (this.gameOver) {
            return { success: false, message: "Game is over." };
        }

        const currentPlayer = this.gameState.getCurrentPlayer();
        let result = { success: false, message: "Unknown action." };

        switch (actionType) {
            case 'travel':
                result = this.gameState.travelTo(params.destination);
                break;
            case 'work':
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

        return result;
    }
}

export default GameController;
