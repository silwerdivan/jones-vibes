import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Player Panel Snapshot Test', () => {
  let dom;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    dom = new JSDOM(html);
  });

  it('should match the snapshot of player 1 panel', () => {
    const player1Panel = dom.window.document.querySelector('#player1-status-panel');
    expect(player1Panel.innerHTML).toMatchSnapshot();
  });

  it('should match the snapshot of player 2 panel', () => {
    const player2Panel = dom.window.document.querySelector('#player2-status-panel');
    expect(player2Panel.innerHTML).toMatchSnapshot();
  });
});
