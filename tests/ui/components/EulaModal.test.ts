import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import EulaModal from '../../../src/ui/components/EulaModal.js';
import EventBus from '../../../src/EventBus.js';

describe('EulaModal', () => {
    let modal: EulaModal;

    beforeEach(() => {
        vi.useFakeTimers();
        modal = new EulaModal();
        document.body.appendChild(modal.getElement());
    });

    afterEach(() => {
        modal.getElement().remove();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('shows the single-screen game introduction', () => {
        modal.show();

        expect(document.getElementById('eula-status-text')?.textContent).toBe('STATUS: ORIENTATION_READY');
        expect(document.getElementById('eula-accept-btn')?.textContent).toContain('START THE RUN');
        expect(modal.getElement().textContent).not.toContain('OPPONENT_LINK_CONFIGURATION');
        expect(modal.getElement().textContent).not.toContain('OPTIONAL_PROTOCOL_ENHANCEMENTS');
    });

    it('publishes eulaAccepted with no onboarding payload', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        modal.show();

        const acceptBtn = document.getElementById('eula-accept-btn') as HTMLButtonElement;
        acceptBtn.click();

        expect(spy).toHaveBeenCalledWith('eulaAccepted');
    });

    it('runs the typewriter effect for the intro copy', () => {
        modal.show();
        const textContainer = document.getElementById('eula-text-container')!;

        vi.advanceTimersByTime(24);
        expect(textContainer.textContent?.length).toBeGreaterThan(0);

        vi.advanceTimersByTime(4000);
        expect(textContainer.textContent).toContain('pressure-management game');
    });

    it('hides after the fade-out animation completes', () => {
        modal.show();
        modal.hide();

        expect(modal.getElement().classList.contains('hidden')).toBe(false);
        vi.advanceTimersByTime(500);
        expect(modal.getElement().classList.contains('hidden')).toBe(true);
    });
});
