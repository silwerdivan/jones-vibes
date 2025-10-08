import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Body Snapshot Test', () => {
    it('should match the snapshot of the initial body content', () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        const dom = new JSDOM(html);
        const { document } = dom.window;

        // Find the body
        const body = document.body;

        // We expect the body to match the snapshot
        expect(body.innerHTML).toMatchSnapshot();
    });
});