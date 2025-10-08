import { screen, getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');

describe('Event Log Snapshot', () => {
    beforeEach(() => {
        document.body.innerHTML = html;
    });

    test('should match the snapshot for the event log', () => {
        const eventLog = screen.getByTestId('game-log');
        expect(eventLog).toMatchSnapshot();
    });
});
