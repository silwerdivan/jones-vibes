import { screen } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('UI Current State', () => {
  beforeAll(async () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    document.body.innerHTML = html.toString();
    
    // The scripts are loaded as modules, so we need to handle them.
    await import('../../js/app.js');

    // Manually trigger DOMContentLoaded to run the app script
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  });

  test('Main UI containers should be present', () => {
    expect(document.getElementById('player1-status-panel')).not.toBeNull();
    expect(document.getElementById('player2-status-panel')).not.toBeNull();
    expect(document.getElementById('location-info')).not.toBeNull();
    expect(document.getElementById('game-controls')).not.toBeNull();
    expect(document.getElementById('log')).not.toBeNull();
  });

  test('Active player panel should have "current-player" class', () => {
    const player1Panel = screen.getByText(/Player 1/).closest('.player-panel');
    const player2Panel = screen.getByText(/Player 2/).closest('.player-panel');

    expect(player1Panel).toHaveClass('current-player');
    expect(player2Panel).not.toHaveClass('current-player');
  });
});