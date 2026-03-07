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
    });

    it('should start at Step 1', () => {
        modal.show();
        const step1 = document.getElementById('eula-step-1');
        const step2 = document.getElementById('eula-step-2');
        const step3 = document.getElementById('eula-step-3');
        const statusText = document.getElementById('eula-status-text');

        expect(step1?.classList.contains('hidden')).toBe(false);
        expect(step2?.classList.contains('hidden')).toBe(true);
        expect(step3?.classList.contains('hidden')).toBe(true);
        expect(statusText?.textContent).toBe('STATUS: PENDING_ACKNOWLEDGMENT');
    });

    it('should enable continue button when scrolled to bottom', () => {
        modal.show();
        const scrollWrapper = document.getElementById('eula-scroll-wrapper')!;
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;

        expect(continueBtn.disabled).toBe(true);

        // Mock scroll to bottom
        Object.defineProperty(scrollWrapper, 'scrollTop', { value: 100 });
        Object.defineProperty(scrollWrapper, 'clientHeight', { value: 100 });
        Object.defineProperty(scrollWrapper, 'scrollHeight', { value: 200 });
        
        scrollWrapper.dispatchEvent(new Event('scroll'));

        expect(continueBtn.disabled).toBe(false);
    });

    it('should transition through steps correctly', () => {
        modal.show();
        const step1 = document.getElementById('eula-step-1');
        const step2 = document.getElementById('eula-step-2');
        const step3 = document.getElementById('eula-step-3');
        const statusText = document.getElementById('eula-status-text');

        // To Step 2
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        continueBtn.click();
        
        vi.advanceTimersByTime(350);

        expect(step1?.classList.contains('hidden')).toBe(true);
        expect(step2?.classList.contains('hidden')).toBe(false);
        expect(statusText?.textContent).toBe('STATUS: NEURAL_LINK_CONFIG');

        // To Step 3
        const toStep3Btn = document.getElementById('eula-to-step-3-btn') as HTMLButtonElement;
        toStep3Btn.click();
        
        vi.advanceTimersByTime(350);

        expect(step2?.classList.contains('hidden')).toBe(true);
        expect(step3?.classList.contains('hidden')).toBe(false);
        expect(statusText?.textContent).toBe('STATUS: OPTIONAL_ENHANCEMENTS');
    });

    it('should publish eulaAccepted with selected clauses and AI choice', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        modal.show();

        // Advance to Step 3
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        continueBtn.click();
        vi.advanceTimersByTime(350);

        const toStep3Btn = document.getElementById('eula-to-step-3-btn') as HTMLButtonElement;
        toStep3Btn.click();
        vi.advanceTimersByTime(350);

        // Select some clauses
        const checkboxA = document.getElementById('clause-A') as HTMLInputElement;
        if (checkboxA) checkboxA.checked = true;

        const acceptBtn = document.getElementById('eula-accept-btn') as HTMLButtonElement;
        acceptBtn.click();

        expect(spy).toHaveBeenCalledWith('eulaAccepted', expect.objectContaining({
            selectedClauseIds: expect.arrayContaining(['A']),
            isPlayer2AI: true // Default
        }));
    });

    it('should allow toggling opponent in Step 2', () => {
        modal.show();
        
        // Go to Step 2
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        continueBtn.click();
        vi.advanceTimersByTime(350);

        const humanOption = document.querySelector('[data-opponent="human"]') as HTMLElement;
        humanOption.click();

        // Go to Step 3
        const toStep3Btn = document.getElementById('eula-to-step-3-btn') as HTMLButtonElement;
        toStep3Btn.click();
        vi.advanceTimersByTime(350);

        const spy = vi.spyOn(EventBus, 'publish');
        const acceptBtn = document.getElementById('eula-accept-btn') as HTMLButtonElement;
        acceptBtn.click();

        expect(spy).toHaveBeenCalledWith('eulaAccepted', expect.objectContaining({
            isPlayer2AI: false
        }));
    });

    it('should run typewriter effect', () => {
        modal.show();
        const textContainer = document.getElementById('eula-text-container')!;

        // Advance some time
        vi.advanceTimersByTime(20);
        expect(textContainer.textContent?.length).toBeGreaterThan(0);

        // Advance until finished
        vi.advanceTimersByTime(2000);
        expect(textContainer.textContent?.length).toBeGreaterThan(100);
    });
});
