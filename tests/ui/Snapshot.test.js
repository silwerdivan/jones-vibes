import { screen } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('UI Snapshots', () => {
  beforeAll(async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    document.body.innerHTML = html.toString();
    
    // The scripts are loaded as modules, so we need to handle them.
    await import('../../js/app.js');

    // Manually trigger DOMContentLoaded to run the app script
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  });

  test('Player 1 panel should match snapshot', () => {
    const player1Panel = document.getElementById('player1-status-panel');
    expect(player1Panel.innerHTML).toMatchSnapshot();
  });

  test('Player 2 panel should match snapshot', () => {
    const player2Panel = document.getElementById('player2-status-panel');
    expect(player2Panel.innerHTML).toMatchSnapshot();
  });

  test('Info panel should match snapshot', () => {
    const infoPanel = document.getElementById('location-info');
    expect(infoPanel.innerHTML).toMatchSnapshot();
  });

  test('Actions panel should match snapshot', () => {
    const actionsPanel = document.getElementById('game-controls');
    expect(actionsPanel.innerHTML).toMatchSnapshot();
  });

  test('Log panel should match snapshot', () => {
    const logPanel = document.getElementById('log');
    expect(logPanel.innerHTML).toMatchSnapshot();
  });
});