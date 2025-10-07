import { screen, fireEvent, within, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Player Actions and UI Updates', () => {
    beforeEach(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();
        
        // The scripts are loaded as modules, so we need to handle them.
        await import('../../js/app.js');

        // Manually trigger DOMContentLoaded to run the app script
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('It should update player stats when an action is performed', async () => {
        const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
        const timeDisplay = within(player1Panel).getByText(/Time Remaining:/).querySelector('span');

        expect(timeDisplay.textContent).toBe('24');

        const travelButton = screen.getByRole('button', { name: /Travel/i });
        fireEvent.click(travelButton);

        // Wait for the modal to appear by finding its title
        const travelModal = await screen.findByText('Travel to...');
        const modalContainer = travelModal.parentElement;

        const agencyButton = within(modalContainer).getByRole('button', { name: /Employment Agency/i });

        fireEvent.click(agencyButton);

        // Wait for the UI to update
        await waitFor(() => {
            expect(timeDisplay.textContent).toBe('22');
        });
    });

    test('It should switch the highlighted player after a turn ends', async () => {
        const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
        const player2Panel = screen.getByText(/Player 2/).closest('.player-panel');

        // Player 1 starts as the current player
        expect(player1Panel).toHaveClass('current-player');
        expect(player2Panel).not.toHaveClass('current-player');

        const endTurnButton = screen.getByRole('button', { name: /Rest \/ End Turn/i });
        fireEvent.click(endTurnButton);

        // After ending the turn, Player 2 should be the current player
        await waitFor(() => {
            expect(player1Panel).not.toHaveClass('current-player');
            expect(player2Panel).toHaveClass('current-player');
        });
    });
});
