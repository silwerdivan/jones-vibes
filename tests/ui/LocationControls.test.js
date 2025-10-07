import { screen, fireEvent } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Location-Specific Controls', () => {
    beforeEach(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();

        // Clear all modules from the cache to ensure a fresh import for each test
        jest.resetModules();

        // Dynamically import the app.js to re-initialize the game for each test
        await import('../../js/app.js');

        // Manually trigger DOMContentLoaded to run the app script
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('It should only show the \'Travel\' and \'End Turn\' buttons at \'Home\'', () => {
        // Check for the presence of "Travel" and "End Turn" buttons
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Check for the absence of other location-specific buttons
        expect(screen.queryByRole('button', { name: /Work Shift/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Course/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Buy Item/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Deposit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Loan/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Repay Loan/i })).not.toBeInTheDocument();
    });
});
