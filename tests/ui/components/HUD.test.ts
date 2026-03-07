import { describe, it, expect, beforeEach } from 'vitest';
import HUD from '../../../src/ui/components/HUD.js';
import GameState from '../../../src/game/GameState.js';
import type { LogMessage } from '../../../src/models/types.js';

describe('HUD', () => {
    let hud: HUD;
    let container: HTMLElement;
    let mockGameState: GameState;

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.className = 'app-shell';
        document.body.appendChild(container);

        mockGameState = {
            players: [
                { id: 1, credits: 100, time: 24, location: 'Hab-Pod 404', isAI: false, activeConditions: [], calculateBurnRate: () => 150 },
                { id: 2, credits: 200, time: 20, location: 'Labor Sector', isAI: true, activeConditions: [], calculateBurnRate: () => 150 }
            ],
            currentPlayerIndex: 0,
            turn: 1,
            log: [],
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex];
            }
        } as unknown as GameState;

        hud = new HUD();
    });

    it('creates the HUD shell', () => {
        const element = hud.getElement();
        expect(element.tagName).toBe('HEADER');
        expect(element.classList.contains('hud')).toBe(true);
        expect(element.classList.contains('glass')).toBe(true);
    });

    it('renders financial stats for the current player', () => {
        hud.mount(container);
        hud.render(mockGameState);

        expect(hud.getElement().querySelector('[data-credits]')?.textContent).toBe('₡100');
        expect(hud.getElement().querySelector('[data-burn-rate]')?.textContent).toBe('₡150');
    });

    it('switches the active orb when the current player changes', () => {
        hud.mount(container);
        hud.render(mockGameState);
        mockGameState.currentPlayerIndex = 1;
        hud.render(mockGameState);

        expect(hud.getElement().querySelector('[data-orb="p1"]')?.classList.contains('active')).toBe(false);
        expect(hud.getElement().querySelector('[data-orb="p2"]')?.classList.contains('active')).toBe(true);
    });

    it('keeps the reverted orb structure with avatar inside the ring', () => {
        hud.mount(container);
        hud.render(mockGameState);

        const orb = hud.getElement().querySelector('[data-orb="p1"]') as HTMLElement;
        const ring = orb.querySelector('[data-time-ring="p1"]');
        const avatar = orb.querySelector('[data-avatar="p1"]');

        expect(ring).not.toBeNull();
        expect(avatar).not.toBeNull();
        expect(ring?.compareDocumentPosition(avatar as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(orb.textContent).not.toContain('24h');
    });

    it('updates the news ticker when entries exist', () => {
        const tickerContent = document.createElement('div');
        hud.setNewsTickerContent(tickerContent);
        mockGameState.log = [{ text: 'Test event 1' }, { text: 'Test event 2' }] as LogMessage[];

        hud.render(mockGameState);
        expect(tickerContent.textContent).toContain('Test event 1');
        expect(tickerContent.textContent).toContain('Test event 2');
    });
});
