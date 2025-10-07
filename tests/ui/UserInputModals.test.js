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

    test('It should display the item choice modal when the \'Buy Item\' button is clicked', async () => {
        // First, travel to the Shopping Mall
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Shopping Mall/i }));
        });

        // Now, click the "Buy Item" button
        await waitFor(() => {
            const buyItemButton = screen.getByRole('button', { name: /Buy Item/i });
            expect(buyItemButton).toBeInTheDocument();
            expect(buyItemButton).not.toHaveClass('hidden');
            fireEvent.click(buyItemButton);
        });

        // Wait for the item choice modal to appear
        const itemModal = await screen.findByRole('heading', { name: /Buy an Item/i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Verify the modal title
        expect(within(itemModal).getByRole('heading', { name: /Buy an Item/i })).toBeInTheDocument();

        // Verify item buttons are present
        expect(within(itemModal).getByRole('button', { name: /Coffee/i })).toBeInTheDocument();
        expect(within(itemModal).getByRole('button', { name: /Movie Ticket/i })).toBeInTheDocument();
        expect(within(itemModal).getByRole('button', { name: /New Clothes/i })).toBeInTheDocument();
        expect(within(itemModal).getByRole('button', { name: /Concert Ticket/i })).toBeInTheDocument();
        expect(within(itemModal).getByRole('button', { name: /Vacation Package/i })).toBeInTheDocument();

        // Verify Cancel button is present
        expect(within(itemModal).getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    test('It should display the number input modal for bank actions', async () => {
        // First, travel to the Bank
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Bank/i }));
        });

        // Now, click the "Deposit" button
        await waitFor(() => {
            const depositButton = screen.getByRole('button', { name: /Deposit/i });
            expect(depositButton).toBeInTheDocument();
            expect(depositButton).not.toHaveClass('hidden');
            fireEvent.click(depositButton);
        });

        // Wait for the number input modal to appear
        const numberInputModal = await screen.findByRole('heading', { name: /Enter amount to deposit:/i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Verify the modal title
        expect(within(numberInputModal).getByRole('heading', { name: /Enter amount to deposit:/i })).toBeInTheDocument();

        // Verify number input field is present
        expect(within(numberInputModal).getByRole('spinbutton')).toBeInTheDocument(); // 'spinbutton' is the ARIA role for number input

        // Verify Confirm button is present
        expect(within(numberInputModal).getByRole('button', { name: /Confirm/i })).toBeInTheDocument();

        // Verify Cancel button is present
        expect(within(numberInputModal).getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
});