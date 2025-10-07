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

        expect(screen.queryByRole('button', { name: /Work Shift/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Course/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Buy Item/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Deposit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Loan/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Repay Loan/i })).not.toBeInTheDocument();
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
        expect(screen.queryByRole('button', { name: /Take Course/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Buy Item/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Deposit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Loan/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Repay Loan/i })).not.toBeInTheDocument();
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
        expect(screen.queryByRole('button', { name: /Work Shift/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Buy Item/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Deposit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Withdraw/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Take Loan/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Repay Loan/i })).not.toBeInTheDocument();
    });
});
