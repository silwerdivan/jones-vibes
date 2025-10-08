import { screen, within } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Game Initialization and Player Status', () => {
    beforeAll(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();
        
        // The scripts are loaded as modules, so we need to handle them.
        await import('../../js/app.js');

        // Manually trigger DOMContentLoaded to run the app script
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('It should display the main game title', () => {
        const title = screen.getByRole('heading', { name: /Jones in the Fast Lane/i });
        expect(title).toBeInTheDocument();
    });

    test('It should render both player status panels', () => {
        const player1Panel = screen.getByText(/Player 1/);
        const player2Panel = screen.getByText(/Player 2 \(AI\)/);
        expect(player1Panel).toBeInTheDocument();
        expect(player2Panel).toBeInTheDocument();
    });

    test('It should display the correct initial stats for both players', () => {
        const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
        const player2Panel = screen.getByText(/Player 2 \(AI\)/).closest('.player-panel');

        // Player 1
        const p1CashValue = within(player1Panel).getByText('Cash:').nextElementSibling;
        expect(p1CashValue).toHaveTextContent('0');
        expect(p1CashValue).toHaveClass('currency');

        const p1SavingsValue = within(player1Panel).getByText('Savings:').nextElementSibling;
        expect(p1SavingsValue).toHaveTextContent('0');

        const p1LoanValue = within(player1Panel).getByText('Loan:').nextElementSibling;
        expect(p1LoanValue).toHaveTextContent('0');

        // Player 2
        const p2CashValue = within(player2Panel).getByText('Cash:').nextElementSibling;
        expect(p2CashValue).toHaveTextContent('0');
        expect(p2CashValue).toHaveClass('currency');

        const p2SavingsValue = within(player2Panel).getByText('Savings:').nextElementSibling;
        expect(p2SavingsValue).toHaveTextContent('0');

        const p2LoanValue = within(player2Panel).getByText('Loan:').nextElementSibling;
        expect(p2LoanValue).toHaveTextContent('0');
    });

    test('It should highlight Player 1 as the current player on an initial load', () => {
        const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
        const player2Panel = screen.getByText(/Player 2 \(AI\)/).closest('.player-panel');

        expect(player1Panel).toHaveClass('current-player');
        expect(player2Panel).not.toHaveClass('current-player');
    });

    test('It should display the correct initial location and turn', () => {
        const locationDisplay = screen.getByText(/Current Location:/);
        const turnDisplay = screen.getByText(/Turn:/);

        expect(locationDisplay).toHaveTextContent('Current Location: Home');
        expect(turnDisplay).toHaveTextContent('Turn: 1');
    });

    test('It should display the game log section', () => {
        const gameLog = screen.getByText(/Game Log/);
        expect(gameLog).toBeInTheDocument();
    });
});