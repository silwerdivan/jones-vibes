import { screen, fireEvent, waitFor, within } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Location-Specific Controls', () => {
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

    test('It should only show the \'Travel\' and \'End Turn\' buttons at \'Home\'', () => {
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /Work Shift/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Course/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Buy Item/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Deposit/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Withdraw/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Loan/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Repay Loan/i })).toHaveClass('hidden');
    });

    test('It should show the \'Work Shift\' button at the \'Employment Agency\'', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear and get a reference to it
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Click "Employment Agency" within the modal
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Employment Agency/i }));
        });

        // Wait for the UI to update and the Work Shift button to become visible
        await waitFor(() => {
            const workShiftButton = screen.getByRole('button', { name: /Work Shift/i });
            expect(workShiftButton).toBeInTheDocument();
            expect(workShiftButton).not.toHaveClass('hidden');
        });

        // Verify Travel and End Turn buttons are still visible (Travel is always visible, End Turn should be too)
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Verify other location-specific buttons are hidden
        expect(screen.getByRole('button', { name: /Take Course/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Buy Item/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Deposit/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Withdraw/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Loan/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Repay Loan/i })).toHaveClass('hidden');
    });

    test('It should show the \'Take Course\' button at the \'Community College\'', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear and get a reference to it
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Click "Community College" within the modal
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Community College/i }));
        });

        // Wait for the UI to update and the Take Course button to become visible
        await waitFor(() => {
            const takeCourseButton = screen.getByRole('button', { name: /Take Course/i });
            expect(takeCourseButton).toBeInTheDocument();
            expect(takeCourseButton).not.toHaveClass('hidden');
        });

        // Verify Travel and End Turn buttons are still visible
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Verify other location-specific buttons are hidden
        expect(screen.getByRole('button', { name: /Work Shift/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Buy Item/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Deposit/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Withdraw/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Loan/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Repay Loan/i })).toHaveClass('hidden');
    });

    test('It should show the \'Buy Item\' button at the \'Shopping Mall\'', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear and get a reference to it
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Click "Shopping Mall" within the modal
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Shopping Mall/i }));
        });

        // Wait for the UI to update and the Buy Item button to become visible
        await waitFor(() => {
            const buyItemButton = screen.getByRole('button', { name: /Buy Item/i });
            expect(buyItemButton).toBeInTheDocument();
            expect(buyItemButton).not.toHaveClass('hidden');
        });

        // Verify Travel and End Turn buttons are still visible
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Verify other location-specific buttons are hidden
        expect(screen.getByRole('button', { name: /Work Shift/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Course/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Deposit/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Withdraw/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Loan/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Repay Loan/i })).toHaveClass('hidden');
    });

    test('It should show all bank-related buttons at the \'Bank\'', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear and get a reference to it
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Click "Bank" within the modal
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Bank/i }));
        });

        // Wait for the UI to update and the bank-related buttons to become visible
        await waitFor(() => {
            const depositButton = screen.getByRole('button', { name: /Deposit/i });
            const withdrawButton = screen.getByRole('button', { name: /Withdraw/i });
            const takeLoanButton = screen.getByRole('button', { name: /Take Loan/i });
            const repayLoanButton = screen.getByRole('button', { name: /Repay Loan/i });
            const buyCarButton = screen.getByRole('button', { name: /Buy Car/i }); // Also visible at Bank

            expect(depositButton).toBeInTheDocument();
            expect(depositButton).not.toHaveClass('hidden');
            expect(withdrawButton).toBeInTheDocument();
            expect(withdrawButton).not.toHaveClass('hidden');
            expect(takeLoanButton).toBeInTheDocument();
            expect(takeLoanButton).not.toHaveClass('hidden');
            expect(repayLoanButton).toBeInTheDocument();
            expect(repayLoanButton).not.toHaveClass('hidden');
            expect(buyCarButton).toBeInTheDocument();
            expect(buyCarButton).not.toHaveClass('hidden');
        });

        // Verify Travel and End Turn buttons are still visible
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Verify other location-specific buttons are hidden
        expect(screen.getByRole('button', { name: /Work Shift/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Course/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Buy Item/i })).toHaveClass('hidden');
    });

    test('It should show the \'Buy Car\' button at the \'Used Car Lot\'', async () => {
        // Click the Travel button
        fireEvent.click(screen.getByRole('button', { name: /Travel/i }));

        // Wait for the modal to appear and get a reference to it
        const travelModal = await screen.findByRole('heading', { name: /Travel to.../i }).then(heading => heading.closest('div[id^="choice-modal"]'));

        // Click "Used Car Lot" within the modal
        await waitFor(() => {
            fireEvent.click(within(travelModal).getByRole('button', { name: /Used Car Lot/i }));
        });

        // Wait for the UI to update and the Buy Car button to become visible
        await waitFor(() => {
            const buyCarButton = screen.getByRole('button', { name: /Buy Car/i });
            expect(buyCarButton).toBeInTheDocument();
            expect(buyCarButton).not.toHaveClass('hidden');
        });

        // Verify Travel and End Turn buttons are still visible
        expect(screen.getByRole('button', { name: /Travel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /End Turn/i })).toBeInTheDocument();

        // Verify other location-specific buttons are hidden
        expect(screen.getByRole('button', { name: /Work Shift/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Course/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Buy Item/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Deposit/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Withdraw/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Take Loan/i })).toHaveClass('hidden');
        expect(screen.getByRole('button', { name: /Repay Loan/i })).toHaveClass('hidden');
    });
});
