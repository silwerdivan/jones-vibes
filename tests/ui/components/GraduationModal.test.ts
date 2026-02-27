import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GraduationModal } from '../../../src/ui/components/Modal.js';
import EventBus from '../../../src/EventBus.js';

describe('GraduationModal', () => {
    let modal: GraduationModal;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <section id="graduation-modal" class="modal-overlay hidden">
                <div class="graduation-container glass">
                    <header class="graduation-header">
                        <div class="graduation-icon">🎓</div>
                        <h1 class="neon-text-cyan animate-pulse">CONGRATULATIONS!</h1>
                        <p id="graduation-subtitle" class="graduation-subtitle">YOU HAVE GRADUATED</p>
                    </header>
                    <main class="graduation-content">
                        <div class="degree-display">
                            <span id="graduated-degree-name" class="degree-name">Associate's Degree</span>
                        </div>
                        <p id="graduation-reward-text" class="reward-text">Level 2 Careers are now unlocked at the Employment Agency.</p>
                    </main>
                    <footer class="graduation-footer">
                        <button id="btn-graduation-dismiss" class="btn btn-primary btn-glow">EXCELLENT!</button>
                    </footer>
                </div>
            </section>
        `;

        modal = new GraduationModal();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be hidden by default', () => {
        expect(modal.isVisible()).toBe(false);
        const overlay = document.getElementById('graduation-modal');
        expect(overlay?.classList.contains('hidden')).toBe(true);
    });

    it('should show correct graduation info', () => {
        const mockPlayer = {
            name: 'Test Player',
            educationLevel: 1
        };
        const mockCourse = {
            name: "Associate's Degree"
        };

        modal.showGraduation(mockPlayer as any, mockCourse as any);

        expect(modal.isVisible()).toBe(true);
        expect(document.getElementById('graduation-subtitle')?.textContent).toBe('TEST PLAYER HAS GRADUATED!');
        expect(document.getElementById('graduated-degree-name')?.textContent).toBe("Associate's Degree");
        expect(document.getElementById('graduation-reward-text')?.textContent).toContain('Level 2 Careers are now unlocked');
    });

    it('should show special text for max level graduation', () => {
        const mockPlayer = {
            name: 'Test Player',
            educationLevel: 5
        };
        const mockCourse = {
            name: "Expert Specialization"
        };

        modal.showGraduation(mockPlayer as any, mockCourse as any);

        expect(document.getElementById('graduation-reward-text')?.textContent).toContain('pinnacle of education');
    });

    it('should hide when dismiss button is clicked', () => {
        modal.showGraduation({ name: 'P1', educationLevel: 1 } as any, { name: 'D1' } as any);
        expect(modal.isVisible()).toBe(true);

        const dismissBtn = document.getElementById('btn-graduation-dismiss');
        dismissBtn?.click();

        expect(modal.isVisible()).toBe(false);
    });

    it('should publish modalShown when shown', () => {
        const spy = vi.spyOn(EventBus, 'publish');
        modal.showGraduation({ name: 'P1', educationLevel: 1 } as any, { name: 'D1' } as any);
        expect(spy).toHaveBeenCalledWith('modalShown', { modalId: 'graduation-modal' });
    });
});
