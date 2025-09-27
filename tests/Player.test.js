import Player from '../js/game/Player';

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player();
    });

    test('constructor sets default values correctly', () => {
        expect(player.cash).toBe(0);
        expect(player.savings).toBe(0);
        expect(player.happiness).toBe(50);
        expect(player.educationLevel).toBe(0);
        expect(player.careerLevel).toBe(0);
        expect(player.time).toBe(24);
        expect(player.location).toBe('Home');
        expect(player.hasCar).toBe(false);
        expect(player.loan).toBe(0);
    });

    test('addCash increases cash', () => {
        player.addCash(100);
        expect(player.cash).toBe(100);
    });

    test('spendCash decreases cash and returns true if sufficient funds', () => {
        player.addCash(100);
        expect(player.spendCash(50)).toBe(true);
        expect(player.cash).toBe(50);
    });

    test('spendCash returns false and does not decrease cash if insufficient funds', () => {
        player.addCash(50);
        expect(player.spendCash(100)).toBe(false);
        expect(player.cash).toBe(50);
    });

    test('updateHappiness increases happiness', () => {
        player.updateHappiness(10);
        expect(player.happiness).toBe(60);
    });

    test('updateHappiness decreases happiness', () => {
        player.updateHappiness(-10);
        expect(player.happiness).toBe(40);
    });

    test('updateHappiness caps happiness at 100', () => {
        player.updateHappiness(60);
        expect(player.happiness).toBe(100);
    });

    test('updateHappiness floors happiness at 0', () => {
        player.updateHappiness(-60);
        expect(player.happiness).toBe(0);
    });

    test('advanceEducation increments educationLevel', () => {
        player.advanceEducation();
        expect(player.educationLevel).toBe(1);
    });

    test('advanceCareer increments careerLevel', () => {
        player.advanceCareer();
        expect(player.careerLevel).toBe(1);
    });

    test('updateTime decreases time', () => {
        player.updateTime(5);
        expect(player.time).toBe(19);
    });

    test('setLocation sets the player location', () => {
        player.setLocation('Work');
        expect(player.location).toBe('Work');
    });

    test('giveCar sets hasCar to true', () => {
        player.giveCar();
        expect(player.hasCar).toBe(true);
    });

    test('takeLoan increases loan amount', () => {
        player.takeLoan(1000);
        expect(player.loan).toBe(1000);
    });

    test('repayLoan decreases loan amount and returns true if sufficient loan', () => {
        player.takeLoan(1000);
        expect(player.repayLoan(500)).toBe(true);
        expect(player.loan).toBe(500);
    });

    test('repayLoan returns false and does not decrease loan if insufficient loan', () => {
        player.takeLoan(500);
        expect(player.repayLoan(1000)).toBe(false);
        expect(player.loan).toBe(500);
    });

    test('deposit moves cash to savings and returns true if sufficient cash', () => {
        player.addCash(200);
        expect(player.deposit(100)).toBe(true);
        expect(player.cash).toBe(100);
        expect(player.savings).toBe(100);
    });

    test('deposit returns false and does not move cash if insufficient cash', () => {
        player.addCash(50);
        expect(player.deposit(100)).toBe(false);
        expect(player.cash).toBe(50);
        expect(player.savings).toBe(0);
    });

    test('withdraw moves savings to cash and returns true if sufficient savings', () => {
        player.addCash(200);
        player.deposit(200);
        expect(player.withdraw(100)).toBe(true);
        expect(player.cash).toBe(100);
        expect(player.savings).toBe(100);
    });

    test('withdraw returns false and does not move savings if insufficient savings', () => {
        player.addCash(50);
        player.deposit(50);
        expect(player.withdraw(100)).toBe(false);
        expect(player.cash).toBe(0);
        expect(player.savings).toBe(50);
    });
});
