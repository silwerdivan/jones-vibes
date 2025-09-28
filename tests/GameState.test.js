import GameState from '../js/game/GameState.js';
import Player from '../js/game/Player.js';
import { LOCATIONS, JOBS, SHOPPING_ITEMS } from '../js/game/gameData.js';

jest.mock('../js/game/Player.js'); // Mock the Player class

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        // Reset the mock before each test
        Player.mockClear();
        // Mock Player constructor to return a simple object for testing
        Player.mockImplementation(() => {
            const player = {
                cash: 1000,
                savings: 0,
                happiness: 50,
                educationLevel: 0,
                careerLevel: 0,
                time: 24,
                location: 'Home',
                hasCar: false,
                loan: 0,
                spendCash: jest.fn(amount => {
                    if (player.cash >= amount) {
                        player.cash -= amount;
                        return true;
                    }
                    return false;
                }),
                addCash: jest.fn(amount => {
                    player.cash += amount;
                }),
                updateHappiness: jest.fn(points => {
                    player.happiness += points;
                    if (player.happiness > 100) {
                        player.happiness = 100;
                    } else if (player.happiness < 0) {
                        player.happiness = 0;
                    }
                }),
                updateTime: jest.fn(hours => {
                    player.time += hours; // Correctly update the player's time
                }),
                setLocation: jest.fn(newLocation => {
                    player.location = newLocation;
                }),
                advanceEducation: jest.fn(() => {
                    player.educationLevel++;
                }),
                // advanceCareer: jest.fn(), // No longer directly called by GameState.workShift
                // Add other player properties and methods as needed for tests
            };
            return player;
        });
    });

    // Test 1: Constructor - 1 player
    test('constructor initializes with 1 player correctly', () => {
        gameState = new GameState(1);
        expect(gameState.players.length).toBe(1);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
        expect(gameState.DAILY_EXPENSE).toBe(50);
        expect(Player).toHaveBeenCalledTimes(1);
    });

    // Test 2: Constructor - 2 players
    test('constructor initializes with 2 players correctly', () => {
        gameState = new GameState(2);
        expect(gameState.players.length).toBe(2);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(1);
        expect(gameState.DAILY_EXPENSE).toBe(50);
        expect(Player).toHaveBeenCalledTimes(2);
    });

    // Test 3: Constructor - invalid number of players
    test('constructor throws error for invalid number of players', () => {
        expect(() => new GameState(0)).toThrow("Game can only be played with 1 or 2 players.");
        expect(() => new GameState(3)).toThrow("Game can only be played with 1 or 2 players.");
    });

    // Test 4: getCurrentPlayer()
    test('getCurrentPlayer returns the correct player', () => {
        gameState = new GameState(2);
        const player1 = gameState.players[0];
        expect(gameState.getCurrentPlayer()).toBe(player1);

        gameState.currentPlayerIndex = 1;
        const player2 = gameState.players[1];
        expect(gameState.getCurrentPlayer()).toBe(player2);
    });

    // Test 5: endTurn() - expense deduction and time reset
    test('endTurn deducts daily expense and resets time for current player', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.cash = 1000; // Set initial cash for testing
        currentPlayer.time = 10; // Set initial time for testing

        gameState.endTurn();

        expect(currentPlayer.spendCash).toHaveBeenCalledWith(gameState.DAILY_EXPENSE);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(14); // 24 - 10 = 14
    });

    // Test 6: endTurn() - currentPlayerIndex advancement (2 players)
    test('endTurn advances currentPlayerIndex and loops back for 2 players', () => {
        gameState = new GameState(2);

        // Player 1's turn
        expect(gameState.currentPlayerIndex).toBe(0);
        gameState.endTurn();
        // Should be Player 2's turn
        expect(gameState.currentPlayerIndex).toBe(1);
        expect(gameState.turn).toBe(1); // Turn should not increment yet

        gameState.endTurn();
        // Should loop back to Player 1's turn
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2); // Turn should increment after full cycle
    });

    // Test 7: endTurn() - turn counter increments correctly for 1 player
    test('endTurn increments turn counter correctly for 1 player', () => {
        gameState = new GameState(1);

        expect(gameState.turn).toBe(1);
        gameState.endTurn();
        expect(gameState.turn).toBe(2);
        gameState.endTurn();
        expect(gameState.turn).toBe(3);
    });

    // Test 8: endTurn() - time reset does not exceed 48 (max time)
    test('endTurn resets player time to 24, not exceeding 48', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 40; // Player has more than 24 hours

        gameState.endTurn();
        // Should reset to 24, meaning updateTime is called with 24 - 40 = -16
        // The Player.js updateTime method should handle the actual cap, but we test the input here.
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(24 - 40);
    });

    // Test 9: travelTo - successful travel without a car
    test('travelTo deducts 2 hours and updates location without a car', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 10;
        currentPlayer.location = 'Home';
        currentPlayer.hasCar = false;

        const result = gameState.travelTo('Bank');

        expect(result.success).toBe(true);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-2);
        expect(currentPlayer.setLocation).toHaveBeenCalledWith('Bank');
        expect(currentPlayer.location).toBe('Bank');
    });

    // Test 10: travelTo - successful travel with a car
    test('travelTo deducts 1 hour and updates location with a car', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 10;
        currentPlayer.location = 'Home';
        currentPlayer.hasCar = true;

        const result = gameState.travelTo('Bank');

        expect(result.success).toBe(true);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-1);
        expect(currentPlayer.setLocation).toHaveBeenCalledWith('Bank');
        expect(currentPlayer.location).toBe('Bank');
    });

    // Test 11: travelTo - not enough time
    test('travelTo fails if not enough time for the trip', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 1;
        currentPlayer.location = 'Home';
        currentPlayer.hasCar = false;

        const result = gameState.travelTo('Bank');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Not enough time for the trip.');
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.setLocation).not.toHaveBeenCalled();
        expect(currentPlayer.location).toBe('Home');
    });

    // Test 12: travelTo - invalid destination
    test('travelTo throws error for invalid destination', () => {
        gameState = new GameState(1);
        expect(() => gameState.travelTo('Invalid Location')).toThrow('Invalid destination: Invalid Location');
    });

    // Test 13: travelTo - already at destination
    test('travelTo does nothing if already at destination', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.time = 10;
        currentPlayer.location = 'Home';

        const result = gameState.travelTo('Home');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Already at this location.');
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.setLocation).not.toHaveBeenCalled();
        expect(currentPlayer.location).toBe('Home');
    });

    // Test 14: workShift - not at Employment Agency
    test('workShift fails if player is not at Employment Agency', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Home';

        const result = gameState.workShift();

        expect(result.success).toBe(false);
        expect(result.message).toBe('Must be at the Employment Agency to work.');
        expect(currentPlayer.addCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.careerLevel).toBe(0);
    });

    // Test 15: workShift - player with no education can only work Dishwasher
    test('workShift allows player with no education to work only Dishwasher', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Employment Agency';
        currentPlayer.educationLevel = 0;
        currentPlayer.time = 24;
        currentPlayer.cash = 0;
        currentPlayer.careerLevel = 0;

        const result = gameState.workShift();
        const expectedJob = JOBS.find(job => job.title === 'Dishwasher');

        expect(result.success).toBe(true);
        expect(currentPlayer.addCash).toHaveBeenCalledWith(expectedJob.wage * expectedJob.shiftHours);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-expectedJob.shiftHours);
        expect(currentPlayer.careerLevel).toBe(expectedJob.level);
        expect(result.message).toContain(`Worked as a ${expectedJob.title}`);
        expect(result.job.title).toBe('Dishwasher');
    });

    // Test 16: workShift - after completing a course, player can access next level job
    test('workShift allows player to access next level job after education advancement', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Employment Agency';
        currentPlayer.educationLevel = 1; // Player can now access Fast Food Worker
        currentPlayer.time = 24;
        currentPlayer.cash = 0;
        currentPlayer.careerLevel = 0;

        const result = gameState.workShift();
        const expectedJob = JOBS.find(job => job.title === 'Fast Food Worker');

        expect(result.success).toBe(true);
        expect(currentPlayer.addCash).toHaveBeenCalledWith(expectedJob.wage * expectedJob.shiftHours);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-expectedJob.shiftHours);
        expect(currentPlayer.careerLevel).toBe(expectedJob.level);
        expect(result.message).toContain(`Worked as a ${expectedJob.title}`);
        expect(result.job.title).toBe('Fast Food Worker');
    });

    // Test 17: workShift - working successfully deducts time, adds cash, and updates career level
    test('workShift successfully updates time, cash, and careerLevel', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Employment Agency';
        currentPlayer.educationLevel = 2; // Retail Associate
        currentPlayer.time = 24;
        currentPlayer.cash = 100;
        currentPlayer.careerLevel = 1;

        const result = gameState.workShift();
        const expectedJob = JOBS.find(job => job.title === 'Retail Associate');

        expect(result.success).toBe(true);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-expectedJob.shiftHours);
        expect(currentPlayer.addCash).toHaveBeenCalledWith(expectedJob.wage * expectedJob.shiftHours);
        expect(currentPlayer.careerLevel).toBe(expectedJob.level);
        expect(currentPlayer.time).toBe(24 - expectedJob.shiftHours);
        expect(currentPlayer.cash).toBe(100 + (expectedJob.wage * expectedJob.shiftHours));
    });

    // Test 18: workShift - player cannot work if they lack required time
    test('workShift fails if player lacks required time for the shift', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Employment Agency';
        currentPlayer.educationLevel = 0;
        currentPlayer.time = 5; // Dishwasher shift is 6 hours
        currentPlayer.cash = 100;
        currentPlayer.careerLevel = 0;

        const result = gameState.workShift();
        const expectedJob = JOBS.find(job => job.title === 'Dishwasher');

        expect(result.success).toBe(false);
        expect(result.message).toBe(`Not enough time to work the ${expectedJob.title} shift.`);
        expect(currentPlayer.addCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.careerLevel).toBe(0);
        expect(currentPlayer.time).toBe(5);
        expect(currentPlayer.cash).toBe(100);
    });

    // Test 19: workShift - careerLevel does not decrease if working a lower level job
    test('workShift does not decrease careerLevel if working a lower level job', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Employment Agency';
        currentPlayer.educationLevel = 2; // Can work Retail Associate (level 3)
        currentPlayer.time = 24;
        currentPlayer.cash = 100;
        currentPlayer.careerLevel = 3; // Already a higher career level

        const result = gameState.workShift();
        const expectedJob = JOBS.find(job => job.title === 'Retail Associate');

        expect(result.success).toBe(true);
        expect(currentPlayer.careerLevel).toBe(3); // Should remain 3, not drop to 2
        expect(result.message).toContain(`Worked as a ${expectedJob.title}`);
    });

    // Test 20: takeCourse - not at Community College
    test('takeCourse fails if player is not at Community College', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Home';

        const result = gameState.takeCourse(1);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Must be at the Community College to take a course.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 21: takeCourse - course not found
    test('takeCourse fails if courseId is invalid', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';

        const result = gameState.takeCourse(999);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Course not found.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 22: takeCourse - already completed course
    test('takeCourse fails if player has already completed the course or a higher level', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 1; // Player has completed Intro to Business (id:1, milestone:1)

        const result = gameState.takeCourse(1);

        expect(result.success).toBe(false);
        expect(result.message).toBe('You have already completed Intro to Business or a higher level course.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 23: takeCourse - out of sequential order
    test('takeCourse fails if player tries to take a course out of sequential order', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 0; // Player needs to take course for milestone 1

        const result = gameState.takeCourse(2); // Marketing Fundamentals has milestone 2

        expect(result.success).toBe(false);
        expect(result.message).toBe('You must take courses in sequential order. Next course is for education level 1.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 24: takeCourse - insufficient cash
    test('takeCourse fails if player has insufficient cash', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 0;
        currentPlayer.cash = 100; // Intro to Business costs 500
        currentPlayer.time = 24;

        const result = gameState.takeCourse(1);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Not enough cash to take Intro to Business. You need $500.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 25: takeCourse - insufficient time
    test('takeCourse fails if player has insufficient time', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 0;
        currentPlayer.cash = 1000;
        currentPlayer.time = 5; // Intro to Business takes 10 hours

        const result = gameState.takeCourse(1);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Not enough time to take Intro to Business. You need 10 hours.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateTime).not.toHaveBeenCalled();
        expect(currentPlayer.advanceEducation).not.toHaveBeenCalled();
    });

    // Test 26: takeCourse - successful completion
    test('takeCourse successfully completes course, updates cash, time, and education level', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 0;
        currentPlayer.cash = 1000;
        currentPlayer.time = 24;

        const result = gameState.takeCourse(1); // Intro to Business: cost 500, time 10, milestone 1

        expect(result.success).toBe(true);
        expect(result.message).toBe('Successfully completed Intro to Business! Your education level is now 1.');
        expect(currentPlayer.spendCash).toHaveBeenCalledWith(500);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-10);
        expect(currentPlayer.advanceEducation).toHaveBeenCalledTimes(1);
        expect(currentPlayer.educationLevel).toBe(1);
    });

    // Test 27: takeCourse - successful completion of a second course
    test('takeCourse successfully completes a second sequential course', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Community College';
        currentPlayer.educationLevel = 1;
        currentPlayer.cash = 1000;
        currentPlayer.time = 24;

        const result = gameState.takeCourse(2); // Marketing Fundamentals: cost 750, time 15, milestone 2

        expect(result.success).toBe(true);
        expect(result.message).toBe('Successfully completed Marketing Fundamentals! Your education level is now 2.');
        expect(currentPlayer.spendCash).toHaveBeenCalledWith(750);
        expect(currentPlayer.updateTime).toHaveBeenCalledWith(-15);
        expect(currentPlayer.advanceEducation).toHaveBeenCalledTimes(1);
        expect(currentPlayer.educationLevel).toBe(2);
    });

    // Test 28: buyItem - not at Shopping Mall
    test('buyItem fails if player is not at Shopping Mall', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Home';

        const result = gameState.buyItem('Coffee');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Must be at the Shopping Mall to buy items.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateHappiness).not.toHaveBeenCalled();
    });

    // Test 29: buyItem - item not found
    test('buyItem fails if item is not found', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Shopping Mall';

        const result = gameState.buyItem('NonExistentItem');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Item not found.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateHappiness).not.toHaveBeenCalled();
    });

    // Test 30: buyItem - insufficient cash
    test('buyItem fails if player has insufficient cash', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Shopping Mall';
        currentPlayer.cash = 0; // Coffee costs 5

        const result = gameState.buyItem('Coffee');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Not enough cash to buy Coffee. You need $5.');
        expect(currentPlayer.spendCash).not.toHaveBeenCalled();
        expect(currentPlayer.updateHappiness).not.toHaveBeenCalled();
    });

    // Test 31: buyItem - successful purchase
    test('buyItem successfully deducts cash and increases happiness', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Shopping Mall';
        currentPlayer.cash = 100;
        currentPlayer.happiness = 50;

        const coffee = SHOPPING_ITEMS.find(item => item.name === 'Coffee');
        const result = gameState.buyItem('Coffee');

        expect(result.success).toBe(true);
        expect(result.message).toBe(`Successfully bought ${coffee.name}! Your happiness increased by ${coffee.happinessBoost}.`);
        expect(currentPlayer.spendCash).toHaveBeenCalledWith(coffee.cost);
        expect(currentPlayer.updateHappiness).toHaveBeenCalledWith(coffee.happinessBoost);
        expect(currentPlayer.cash).toBe(100 - coffee.cost);
        expect(currentPlayer.happiness).toBe(50 + coffee.happinessBoost);
    });

    // Test 32: buyItem - happiness capped at 100
    test('buyItem caps happiness at 100', () => {
        gameState = new GameState(1);
        const currentPlayer = gameState.getCurrentPlayer();
        currentPlayer.location = 'Shopping Mall';
        currentPlayer.cash = 1000;
        currentPlayer.happiness = 90; // Buying Concert Ticket (30 happiness) would exceed 100

        const concertTicket = SHOPPING_ITEMS.find(item => item.name === 'Concert Ticket');
        const result = gameState.buyItem('Concert Ticket');

        expect(result.success).toBe(true);
        expect(currentPlayer.spendCash).toHaveBeenCalledWith(concertTicket.cost);
        expect(currentPlayer.updateHappiness).toHaveBeenCalledWith(concertTicket.happinessBoost);
        expect(currentPlayer.happiness).toBe(100); // Should be capped at 100
    });
});
