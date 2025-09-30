import AIController from '../js/game/AIController.js';
import { COURSES, SHOPPING_ITEMS } from '../js/game/gameData.js';

describe('AIController', () => {
    let aiController;
    let mockPlayer;
    let mockGameState;

    beforeEach(() => {
        aiController = new AIController();
        mockPlayer = {
            cash: 0,
            savings: 0,
            loan: 0,
            happiness: 0,
            educationLevel: 0,
            careerLevel: 0,
            hasCar: false,
            location: 'Home',
            time: 24,
        };
        mockGameState = {}; // GameState might not be directly used by AIController, but passed as argument
    });

    // Priority 1: Pay Loan
    test('should prioritize traveling to Bank to pay loan if loan > $2000 and not at Bank', () => {
        mockPlayer.loan = 2500;
        mockPlayer.cash = 3000;
        mockPlayer.location = 'Home';
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Bank' } });
    });

    test('should prioritize repaying loan if loan > $2000 and at Bank', () => {
        mockPlayer.loan = 2500;
        mockPlayer.cash = 3000;
        mockPlayer.location = 'Bank';
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'repayLoan', params: { amount: 2500 } });
    });

    test('should repay only available cash if loan > $2000 and at Bank but cash < loan', () => {
        mockPlayer.loan = 2500;
        mockPlayer.cash = 1000;
        mockPlayer.location = 'Bank';
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'repayLoan', params: { amount: 1000 } });
    });

    // Priority 2: Gain Wealth
    test('should prioritize traveling to Employment Agency if cash < $1000 and not at Employment Agency', () => {
        mockPlayer.cash = 500;
        mockPlayer.location = 'Home';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Employment Agency' } });
    });

    test('should prioritize working a shift if cash < $1000 and at Employment Agency', () => {
        mockPlayer.cash = 500;
        mockPlayer.location = 'Employment Agency';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'workShift' });
    });

    // Priority 3: Advance Education
    test('should prioritize traveling to Community College if can afford next course and not there', () => {
        mockPlayer.cash = 1000;
        mockPlayer.educationLevel = 0; // Next course is level 1, cost 500
        mockPlayer.location = 'Home';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 1000; // Ensure not low enough for gain wealth
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Community College' } });
    });

    test('should prioritize taking a course if can afford next course and at Community College', () => {
        mockPlayer.cash = 1000;
        mockPlayer.educationLevel = 0; // Next course is level 1, cost 500
        mockPlayer.location = 'Community College';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 1000; // Ensure not low enough for gain wealth
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'takeCourse', params: { courseId: COURSES[0].id } });
    });

    test('should not prioritize education if cannot afford next course', () => {
        mockPlayer.cash = 100;
        mockPlayer.educationLevel = 0; // Next course is level 1, cost 500
        mockPlayer.location = 'Home';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        // This should fall through to gain wealth
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).not.toEqual({ action: 'travel', params: { destination: 'Community College' } });
        expect(action).toEqual({ action: 'travel', params: { destination: 'Employment Agency' } }); // Falls to gain wealth
    });

    // Priority 4: Boost Happiness
    test('should prioritize traveling to Shopping Mall if happiness < 50 and not there', () => {
        mockPlayer.happiness = 30;
        mockPlayer.cash = 1000; // Can afford some items
        mockPlayer.location = 'Home';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 1000; // Not low enough for gain wealth
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Shopping Mall' } });
    });

    test('should prioritize buying most expensive item if happiness < 50 and at Shopping Mall', () => {
        mockPlayer.happiness = 30;
        mockPlayer.cash = 1000; // Can afford some items
        mockPlayer.location = 'Shopping Mall';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 1000; // Not low enough for gain wealth
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        const mostExpensiveAffordableItem = SHOPPING_ITEMS.filter(item => item.cost <= mockPlayer.cash)
                                                        .reduce((prev, current) => (prev.cost > current.cost) ? prev : current);
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'buyItem', params: { itemName: mostExpensiveAffordableItem.name } });
    });

    test('should not prioritize happiness if no affordable items', () => {
        mockPlayer.happiness = 30;
        mockPlayer.cash = 0; // Cannot afford any items
        mockPlayer.location = 'Shopping Mall';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).not.toEqual({ action: 'buyItem', params: { itemName: expect.any(String) } });
        expect(action).toEqual({ action: 'travel', params: { destination: 'Employment Agency' } }); // Falls to gain wealth
    });

    // Priority 5: Increase Efficiency (Buy Car)
    test('should prioritize traveling to Used Car Lot if cash > $3500, no car, and not there', () => {
        mockPlayer.cash = 4000;
        mockPlayer.hasCar = false;
        mockPlayer.location = 'Home';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 4000; // Not low enough for gain wealth
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        mockPlayer.happiness = 100; // Not low enough for boost happiness
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Used Car Lot' } });
    });

    test('should prioritize buying car if cash > $3500, no car, and at Used Car Lot', () => {
        mockPlayer.cash = 4000;
        mockPlayer.hasCar = false;
        mockPlayer.location = 'Used Car Lot';
        // Ensure higher priorities are not met
        mockPlayer.loan = 0;
        mockPlayer.cash = 4000; // Not low enough for gain wealth
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        mockPlayer.happiness = 100; // Not low enough for boost happiness
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'buyCar' });
    });

    // Catch-all
    test('should travel to Employment Agency if no other priorities met and not there', () => {
        mockPlayer.cash = 2000; // Not low enough for gain wealth
        mockPlayer.loan = 1000; // Not high enough for pay loan
        mockPlayer.happiness = 70; // Not low enough for boost happiness
        mockPlayer.educationLevel = COURSES.length; // All courses taken
        mockPlayer.hasCar = true; // Has car
        mockPlayer.location = 'Home';
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'travel', params: { destination: 'Employment Agency' } });
    });

    test('should work shift if no other priorities met and at Employment Agency', () => {
        mockPlayer.cash = 2000;
        mockPlayer.loan = 1000;
        mockPlayer.happiness = 70;
        mockPlayer.educationLevel = COURSES.length;
        mockPlayer.hasCar = true;
        mockPlayer.location = 'Employment Agency';
        const action = aiController.takeTurn(mockGameState, mockPlayer);
        expect(action).toEqual({ action: 'workShift' });
    });
});