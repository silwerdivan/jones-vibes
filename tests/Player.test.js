const Player = require('../js/game/Player');

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player('Test Player');
    });

    test('constructor sets default values correctly', () => {
        expect(player.name).toBe('Test Player');
        expect(player.cash).toBe(200);
        expect(player.savings).toBe(0);
        expect(player.happiness).toBe(50);
        expect(player.educationLevel).toBe(0);
        expect(player.careerLevel).toBe(0);
        expect(player.time).toBe(24);
        expect(player.location).toBe('Home');
        expect(player.hasCar).toBe(false);
        expect(player.loan).toBe(0);
        expect(player.overdueBills).toBe(0);
    });

    test('addCash increases cash', () => {
        player.addCash(100);
        expect(player.cash).toBe(300);
    });

    test('spendCash decreases cash on success', () => {
        const result = player.spendCash(100);
        expect(result).toBe(true);
        expect(player.cash).toBe(100);
    });

    test('spendCash fails on insufficient funds', () => {
        const result = player.spendCash(300);
        expect(result).toBe(false);
        expect(player.cash).toBe(200);
    });

    test('updateHappiness stays within 0-100 range', () => {
        player.updateHappiness(60);
        expect(player.happiness).toBe(100);
        player.updateHappiness(-120);
        expect(player.happiness).toBe(0);
    });

    test('advanceEducation increases education level', () => {
        player.advanceEducation();
        expect(player.educationLevel).toBe(1);
    });

    test('advanceCareer increases career level', () => {
        player.advanceCareer();
        expect(player.careerLevel).toBe(1);
    });

    test('updateTime decreases time', () => {
        player.updateTime(8);
        expect(player.time).toBe(16);
    });

    test('setLocation changes location', () => {
        player.setLocation('Bank');
        expect(player.location).toBe('Bank');
    });

    test('giveCar sets hasCar to true', () => {
        player.giveCar();
        expect(player.hasCar).toBe(true);
    });

    test('takeLoan increases loan and cash', () => {
        const result = player.takeLoan(1000);
        expect(result).toBe(true);
        expect(player.loan).toBe(1000);
        expect(player.cash).toBe(1200);
    });

    test('takeLoan fails if it exceeds max loan', () => {
        const result = player.takeLoan(3000);
        expect(result).toBe(false);
        expect(player.loan).toBe(0);
        expect(player.cash).toBe(200);
    });

    test('repayLoan decreases loan and cash', () => {
        player.takeLoan(1000);
        const result = player.repayLoan(500);
        expect(result).toBe(true);
        expect(player.loan).toBe(500);
        expect(player.cash).toBe(700); // 200 (initial) + 1000 (loan) - 500 (repayment)
    });

    test('repayLoan fails with insufficient cash', () => {
        player.takeLoan(1000);
        player.spendCash(1100);
        const result = player.repayLoan(500);
        expect(result).toBe(false);
        expect(player.loan).toBe(1000);
        expect(player.cash).toBe(100);
    });

    test('deposit moves cash to savings', () => {
        const result = player.deposit(100);
        expect(result).toBe(true);
        expect(player.cash).toBe(100);
        expect(player.savings).toBe(100);
    });

    test('deposit fails with insufficient cash', () => {
        const result = player.deposit(300);
        expect(result).toBe(false);
        expect(player.cash).toBe(200);
        expect(player.savings).toBe(0);
    });

    test('withdraw moves savings to cash', () => {
        player.deposit(100);
        const result = player.withdraw(50);
        expect(result).toBe(true);
        expect(player.cash).toBe(150);
        expect(player.savings).toBe(50);
    });

    test('withdraw fails with insufficient savings', () => {
        const result = player.withdraw(50);
        expect(result).toBe(false);
        expect(player.cash).toBe(200);
        expect(player.savings).toBe(0);
    });
});
