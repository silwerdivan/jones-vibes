# Long Session Test: Attempt 2 Summary

## Objective
Create a stable, long-session regression test to verify that core player statistics (like cash, happiness, and education) change predictably over a large number of turns. This serves as a baseline for future performance refactoring.

## Initial Problem
The first attempts at this test failed. The player started with the default "Dishwasher" job, which paid $48 per turn. However, the daily expenses were $50. This created a situation where the player had a net loss of $2 each turn they worked, preventing them from ever accumulating enough cash to take courses or improve their situation. The test failed because the player's cash never increased.

## Successful Strategy
The second, successful attempt implemented the following strategy:
1.  **Initial Capital:** The player was given $500 in starting cash.
2.  **Education First:** On the first turn, the player spent hours and money to take the "Fast Food" course.
3.  **Career Advancement:** After completing the course, the player was qualified for the "Fast Food Worker" job, which pays $70 per shift.
4.  **Work Phase:** For the remaining 49 turns of the test, the player worked at the new, more profitable job.

This strategy ensured a positive cash flow, allowing the player's stats to change meaningfully over the session. The final test successfully asserted that the player's cash, happiness, and education level increased as expected.

## Lingering Concern for Future Investigation
A key discrepancy was observed during this test: the player's cash balance was able to go into a negative value. This does not seem to happen during manual gameplay, where an action is typically prevented if the player cannot afford it.

This suggests a potential divergence between the game logic used in the tests and the logic enforced by the UI in the actual game. This should be investigated later to ensure the test environment accurately reflects the real game mechanics.
