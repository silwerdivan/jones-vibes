import { screen, fireEvent, waitFor, within } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('User Input Modals', () => {
    beforeEach(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();

        // Clean up any existing modals from previous tests
        document.querySelectorAll('#choice-modal-overlay').forEach(el => el.remove());
        document.querySelectorAll('#choice-modal').forEach(el => el.remove());

        jest.resetModules();
        await import('../../js/app.js');
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('It should display the travel choice modal when the \'Travel\' button is clicked', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Verify the modal title
        expect(within(travelModal).getByRole('heading', { name: /Travel to.../i })).toBeInTheDocument();

        // Verify location buttons are present
        expect(within(travelModal).getByRole('button', { name: /Home/i })).toBeInTheDocument();
        expect(within(travelModal).getByRole('button', { name: /Employment Agency/i })).toBeInTheDocument();
        expect(within(travelModal).getByRole('button', { name: /Community College/i })).toBeInTheDocument();
        expect(within(travelModal).getByRole('button', { name: /Shopping Mall/i })).toBeInTheDocument();
        expect(within(travelModal).getByRole('button', { name: /Used Car Lot/i })).toBeInTheDocument();
        expect(within(travelModal).getByRole('button', { name: /Bank/i })).toBeInTheDocument();

        // Verify Cancel button is present
        expect(within(travelModal).getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
});
