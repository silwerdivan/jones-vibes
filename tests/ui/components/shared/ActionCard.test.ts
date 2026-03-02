import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createActionCard, createActionCardList, ActionCardConfig } from '../../../../src/ui/components/shared/ActionCard.js';
import { Job, Course, Item } from '../../../../src/models/types.js';
import Player from '../../../../src/game/Player.js';

describe('ActionCard', () => {
    let player: Player;
    let mockOnClick: ActionCardConfig['onClick'];

    beforeEach(() => {
        player = new Player(1);
        mockOnClick = vi.fn();
    });

    describe('createActionCard - Jobs', () => {
        const mockJob: Job = {
            level: 1,
            title: 'Test Job',
            wage: 20,
            shiftHours: 8,
            educationRequired: 1
        };

        it('should create a job card with correct structure', () => {
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('action-card')).toBe(true);
            expect(card.querySelector('.action-card-title')?.textContent).toBe('Test Job');
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Apply');
        });

        it('should show "Hired" button when player has this job', () => {
            player.careerLevel = 1;
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Hired');
            expect(card.classList.contains('hired')).toBe(true);
        });

        it('should show "Lower Level" button when player has better job', () => {
            player.careerLevel = 2;
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Lower Level');
            expect(card.classList.contains('locked')).toBe(true);
        });

        it('should lock card when education requirement not met', () => {
            player.educationLevel = 0;
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('locked')).toBe(true);
            expect(card.querySelector('.action-card-btn')?.hasAttribute('disabled')).toBe(true);
        });

        it('should call onClick when card is clicked', () => {
            player.educationLevel = 1;
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            card.click();
            
            expect(mockOnClick).toHaveBeenCalledWith(mockJob, 'HIRED!', 'success');
        });

        it('should not call onClick when card is locked', () => {
            player.educationLevel = 0;
            const card = createActionCard('jobs', mockJob, { player, onClick: mockOnClick });
            card.click();
            
            expect(mockOnClick).not.toHaveBeenCalled();
        });
    });

    describe('createActionCard - College', () => {
        const mockCourse: Course = {
            id: 1,
            name: 'Test Course',
            cost: 100,
            time: 40,
            educationMilestone: 1
        };

        it('should create a course card with correct structure', () => {
            const card = createActionCard('college', mockCourse, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('action-card')).toBe(true);
            expect(card.querySelector('.action-card-title')?.textContent).toBe('Test Course');
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Study');
        });

        it('should show "Completed" button when course already taken', () => {
            player.educationLevel = 1;
            const card = createActionCard('college', mockCourse, { player, onClick: mockOnClick });
            
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Completed');
            expect(card.classList.contains('hired')).toBe(true);
            expect(card.classList.contains('locked')).toBe(true);
        });

        it('should lock card when education milestone not reached', () => {
            const advancedCourse: Course = {
                id: 2,
                name: 'Advanced Course',
                cost: 200,
                time: 60,
                educationMilestone: 3
            };
            player.educationLevel = 1;
            const card = createActionCard('college', advancedCourse, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('locked')).toBe(true);
        });

        it('should display correct cost and time in meta tags', () => {
            const card = createActionCard('college', mockCourse, { player, onClick: mockOnClick });
            const metaText = card.querySelector('.action-card-meta')?.textContent || '';
            
            expect(metaText).toContain('$100');
            expect(metaText).toContain('40h');
        });

        it('should call onClick with correct feedback for courses', () => {
            const card = createActionCard('college', mockCourse, { player, onClick: mockOnClick });
            card.click();
            
            expect(mockOnClick).toHaveBeenCalledWith(mockCourse, '-$100', 'error');
        });
    });

    describe('createActionCard - Shopping', () => {
        const mockItem: Item = {
            name: 'Test Item',
            cost: 50,
            happinessBoost: 10,
            type: 'essential',
            location: 'Shopping Mall'
        };

        it('should create a shopping card with correct structure', () => {
            const card = createActionCard('shopping', mockItem, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('action-card')).toBe(true);
            expect(card.querySelector('.action-card-title')?.textContent).toBe('Test Item');
            expect(card.querySelector('.action-card-btn')?.textContent?.trim()).toBe('Buy');
        });

        it('should lock card when player cannot afford item', () => {
            player.cash = 10;
            const card = createActionCard('shopping', mockItem, { player, onClick: mockOnClick });
            
            expect(card.classList.contains('locked')).toBe(true);
            expect(card.querySelector('.action-card-btn')?.hasAttribute('disabled')).toBe(true);
        });

        it('should display happiness boost in meta tags', () => {
            const card = createActionCard('shopping', mockItem, { player, onClick: mockOnClick });
            const metaText = card.querySelector('.action-card-meta')?.textContent || '';
            
            expect(metaText).toContain('+10 Morale');
        });

        it('should display hunger reduction if item reduces hunger', () => {
            const foodItem: Item = {
                ...mockItem,
                hungerReduction: 20
            };
            const card = createActionCard('shopping', foodItem, { player, onClick: mockOnClick });
            const metaText = card.querySelector('.action-card-meta')?.textContent || '';
            
            expect(metaText).toContain('-20 Bio-Deficit');
        });

        it('should call onClick with correct feedback for shopping', () => {
            player.cash = 100;
            const card = createActionCard('shopping', mockItem, { player, onClick: mockOnClick });
            card.click();
            
            expect(mockOnClick).toHaveBeenCalledWith(mockItem, '-$50', 'error');
        });
    });

    describe('createActionCardList', () => {
        const mockJobs: Job[] = [
            { level: 1, title: 'Job 1', wage: 20, shiftHours: 8, educationRequired: 1 },
            { level: 2, title: 'Job 2', wage: 30, shiftHours: 8, educationRequired: 2 }
        ];

        it('should create a list container with correct class', () => {
            const list = createActionCardList('jobs', mockJobs, { player, onClick: mockOnClick });
            
            expect(list.classList.contains('action-card-list')).toBe(true);
        });

        it('should create a card for each item', () => {
            const list = createActionCardList('jobs', mockJobs, { player, onClick: mockOnClick });
            const cards = list.querySelectorAll('.action-card');
            
            expect(cards.length).toBe(2);
        });

        it('should create empty list for empty array', () => {
            const list = createActionCardList('jobs', [], { player, onClick: mockOnClick });
            const cards = list.querySelectorAll('.action-card');
            
            expect(cards.length).toBe(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null player gracefully', () => {
            const mockJob: Job = {
                level: 1,
                title: 'Test Job',
                wage: 20,
                shiftHours: 8,
                educationRequired: 1
            };
            
            const card = createActionCard('jobs', mockJob, { player: null, onClick: mockOnClick });
            
            expect(card.classList.contains('action-card')).toBe(true);
            expect(card.querySelector('.action-card-title')?.textContent).toBe('Test Job');
        });

        it('should not throw when onClick is not provided', () => {
            const mockJob: Job = {
                level: 1,
                title: 'Test Job',
                wage: 20,
                shiftHours: 8,
                educationRequired: 1
            };
            
            expect(() => {
                const card = createActionCard('jobs', mockJob, { player });
                card.click();
            }).not.toThrow();
        });
    });
});
