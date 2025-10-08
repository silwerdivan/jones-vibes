import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Info and Actions Panel Snapshot Test', () => {
  let dom;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    dom = new JSDOM(html);
  });

  it('should match the snapshot of the location info panel', () => {
    const locationInfoPanel = dom.window.document.querySelector('#location-info');
    expect(locationInfoPanel.innerHTML).toMatchSnapshot();
  });

  it('should match the snapshot of the game controls panel', () => {
    const gameControlsPanel = dom.window.document.querySelector('#game-controls');
    expect(gameControlsPanel.innerHTML).toMatchSnapshot();
  });
});
