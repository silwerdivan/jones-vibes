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
        modal.hide();
        modal.getElement().remove();
        vi.restoreAllMocks();
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('should start at Step 1', () => {
        modal.show();
        const step1 = document.getElementById('eula-step-1');
        const step2 = document.getElementById('eula-step-2');
        
        expect(step1?.classList.contains('hidden')).toBe(false);
        expect(step2?.classList.contains('hidden')).toBe(true);
    });

    it('should enable continue button when scrolled to bottom', () => {
        modal.show();
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        const scrollWrapper = document.getElementById('eula-scroll-wrapper')!;
        
        expect(continueBtn.disabled).toBe(true);

        // Mock scroll values - JSDOM doesn't calculate these layout properties
        Object.defineProperty(scrollWrapper, 'scrollTop', { value: 1000, configurable: true });
        Object.defineProperty(scrollWrapper, 'clientHeight', { value: 500, configurable: true });
        Object.defineProperty(scrollWrapper, 'scrollHeight', { value: 1450, configurable: true });

        scrollWrapper.dispatchEvent(new Event('scroll'));

        expect(continueBtn.disabled).toBe(false);
        const scrollNote = document.getElementById('eula-scroll-note');
        expect(scrollNote?.classList.contains('hidden')).toBe(true);
    });

    it('should transition to Step 2 when continue is clicked', () => {
        modal.show();
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        
        continueBtn.click();
        
        // Fast-forward transition timer (300ms in code)
        vi.advanceTimersByTime(350);

        const step1 = document.getElementById('eula-step-1');
        const step2 = document.getElementById('eula-step-2');
        const statusText = document.getElementById('eula-status-text');

        expect(step1?.classList.contains('hidden')).toBe(true);
        expect(step2?.classList.contains('hidden')).toBe(false);
        expect(statusText?.textContent).toBe('STATUS: OPTIONAL_ENHANCEMENTS');
    });

    it('should publish eulaAccepted with selected clauses', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        modal.show();
        
        // Go to step 2
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        continueBtn.click();
        vi.advanceTimersByTime(350);

        // Select some clauses
        const checkboxA = document.getElementById('clause-A') as HTMLInputElement;
        const checkboxC = document.getElementById('clause-C') as HTMLInputElement;
        
        // In JSDOM we can just set checked = true
        checkboxA.checked = true;
        checkboxC.checked = true;

        const acceptBtn = document.getElementById('eula-accept-btn') as HTMLButtonElement;
        acceptBtn.click();

        expect(spy).toHaveBeenCalledWith('eulaAccepted', {
            selectedClauseIds: ['A', 'C']
        });
    });

    it('should run typewriter effect', () => {
        modal.show();
        const textContainer = document.getElementById('eula-text-container')!;
        
        // Advance some time
        vi.advanceTimersByTime(20);
        expect(textContainer.textContent?.length).toBeGreaterThan(0);
        
        // Complete typewriter
        vi.advanceTimersByTime(10000);
        expect(textContainer.textContent?.length).toBeGreaterThan(100);
    });

    it('should show with Step 1 even if previously on Step 2', () => {
        modal.show();
        const continueBtn = document.getElementById('eula-continue-btn') as HTMLButtonElement;
        continueBtn.disabled = false;
        continueBtn.click();
        vi.advanceTimersByTime(350);
        
        expect(document.getElementById('eula-step-2')?.classList.contains('hidden')).toBe(false);
        
        modal.hide();
        vi.advanceTimersByTime(550);
        modal.show();
        
        expect(document.getElementById('eula-step-1')?.classList.contains('hidden')).toBe(false);
        expect(document.getElementById('eula-step-2')?.classList.contains('hidden')).toBe(true);
    });
});
