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
        within(player1Panel).getByText((content, element) => element.textContent === 'Cash: $0');
        within(player1Panel).getByText((content, element) => element.textContent === 'Savings: $0');
        within(player1Panel).getByText((content, element) => element.textContent === 'Loan: $0');

        // Player 2
        within(player2Panel).getByText((content, element) => element.textContent === 'Cash: $0');
        within(player2Panel).getByText((content, element) => element.textContent === 'Savings: $0');
        within(player2Panel).getByText((content, element) => element.textContent === 'Loan: $0');
    });

    test('It should highlight Player 1 as the current player on an initial load', () => {
        const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
        const player2Panel = screen.getByText(/Player 2 \(AI\)/).closest('.player-panel');

        expect(player1Panel).toHaveClass('current-player');
        expect(player2Panel).not.toHaveClass('current-player');
    });
});