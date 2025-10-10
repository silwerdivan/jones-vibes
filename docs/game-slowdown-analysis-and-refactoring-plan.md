Game Performance Refactoring Plan

  This plan outlines the steps to diagnose and resolve the progressive slowdown in the "Jones in the Fast Lane" game. The approach is centered around methodical, test-driven
  refactoring to ensure stability and measurable improvements.

  ---

   - [ ] Phase 1: Diagnosis and Performance Baselining
     - [x] Benchmark Initial Performance:
       - Action: Play the game for 15-20 minutes (simulating many turns) while recording a performance profile using the browser's Developer Tools (Performance and Memory tabs).     
       - Goal: Establish a baseline measurement of the problem. Save the performance profile recording. Look for:
           - Long Frames: Frames that take significantly longer than 16.7ms to render.
           - Expensive Function Calls: Identify functions that consume the most CPU time in the "Main" thread of the performance profile.
           - Memory Usage Pattern: Observe the memory graph for a "sawtooth" pattern. A healthy pattern shows memory increasing and then dropping back to a low baseline after garbage
             collection. If the baseline consistently creeps up, it indicates a memory leak.
     - [x] Analyze Heap Snapshots for Memory Leaks:
       - Action: Take a heap snapshot at the beginning of the game. Play for 10-15 minutes. Take another heap snapshot.
       - Goal: Compare the two snapshots to identify objects that are accumulating. Pay close attention to "Detached DOM tree" entries, which are a clear sign of DOM nodes that were 
         removed from the page but are still held in memory, often by lingering event listeners.
     - [x] Write a High-Level Regression Test:
       - Action: Create a new Jest test file (tests/ui/LongSession.test.js). This test will simulate a long gameplay session by programmatically advancing through many turns and     
         performing common actions (e.g., working, studying).
       - Goal: This test will serve as a safety net. It should verify that core game mechanics (e.g., player stats updating, day advancing) still function correctly after many turns.
         It won't test performance itself, but it will prevent breaking the game during refactoring.
       - Verification: Run npm test and ensure the new test passes before proceeding.

   - [ ] Phase 2: Refactoring Event Handling (Hypothesis: Event Listener Leaks)
     - [ ] Write a Pre-Refactoring Test for Event Handlers:
       - Action: In a relevant UI test file (e.g., tests/ui/PlayerActions.test.js), write a test that spies on addEventListener and removeEventListener on a specific, frequently     
         updated UI element (like the action buttons). The test should simulate a few turns and assert that for every addEventListener call, a corresponding removeEventListener call 
         is made.
       - Goal: To programmatically prove the hypothesis that listeners are not being cleaned up. This test will initially fail if the leak exists.
     - [ ] Refactor UI Event Listeners to Use Event Delegation:
       - Hypothesis: The game may be attaching new event listeners to buttons or other elements every time the UI is re-rendered, without removing the old ones. This is a classic    
         cause of memory leaks.
       - Action: Modify the UI rendering logic (likely in js/app.js or js/ui.js) to use event delegation. Attach a single event listener to a static parent container that is always  
         present in the DOM (e.g., #info-and-actions-panel or document.body). Use event.target.closest('[data-action]') or similar to identify which button was clicked based on data-
         attributes.
       - Verification:
           1. Run the pre-refactoring test written in the previous step. It should now pass, confirming that you are no longer adding/removing listeners repeatedly.
           2. Run the full test suite (npm test), including the LongSession.test.js, to ensure all UI interactions still work as expected.

   - [ ] Phase 3: Optimizing DOM Manipulation (Hypothesis: Inefficient UI Updates)
     - [ ] Write a Pre-Refactoring Snapshot Test:
       - Action: Use the existing Jest snapshot testing setup (tests/ui/Snapshot.test.js or similar). Create a test that captures a snapshot of a specific, dynamic part of the UI   
         (e.g., the player stats panel). Then, perform a game action that only changes one value in that panel and take another snapshot.
       - Goal: To have a baseline snapshot. The goal of the refactor will be to update only the changed text node, not the entire parent element. While the snapshot will look the   
         same, this test provides a clear scenario for manual inspection during the refactor.
     - [ ] Implement Targeted DOM Updates:
       - Hypothesis: The application might be re-rendering large chunks of the DOM on every small state change (e.g., using innerHTML = '...' on a large container). This is
         inefficient and causes layout thrashing.
       - Action: Refactor the UI update functions. Instead of replacing entire HTML blocks, query for the specific elements that need updating (e.g., #player-cash-value,
         #player-happiness-value) and update only their textContent. This is far more performant.
       - Verification:
           1. Manually inspect the UI update in the browser's DevTools (Elements panel). When a stat changes, only the text node inside the element should flash, not the entire     
              element or its parent.
           2. Run all UI tests (npm test) to ensure the UI still displays the correct data after the refactor. The snapshots should not have changed.

   - [ ] Phase 4: Analyzing Game Loop Computations (Hypothesis: Expensive Logic)
     - [ ] Write Performance-Focused Unit Tests:
       - Action: Identify potentially expensive functions in GameController.js or GameState.js (e.g., loops that iterate over growing arrays). Write new Jest tests that run these    
         specific functions with a large, late-game state. Use console.time() and console.timeEnd() within the tests to measure their execution time.
       - Goal: To pinpoint specific algorithms whose complexity increases non-linearly with the size of the game state.
     - [ ] Refactor Inefficient Game Logic:
       - Hypothesis: As the game progresses, certain calculations may become more complex (e.g., searching through a long history of events, complex AI decisions).
       - Action: Based on the performance unit tests, refactor the identified bottlenecks. This could involve optimizing loops, using more efficient data structures (e.g., using Maps
         for O(1) lookups instead of searching Arrays), or memoizing pure functions whose results are frequently recalculated with the same inputs.
       - Verification: Re-run the performance-focused unit tests. The execution time measured by console.time() should be significantly reduced. Ensure all other game logic tests in 
         npm test continue to pass.

   - [ ] Phase 5: Final Validation and Benchmarking
     - [ ] Run Final Performance Profile:
       - Action: Repeat the same 15-20 minute gameplay session from Phase 1, recording a new performance profile.
       - Goal: To get a final, "after" measurement to compare against the "before" baseline.
     - [ ] Compare and Verify Fix:
       - Action: Compare the new performance profile and heap snapshots with the baseline recordings from Phase 1.
       - Goal: Verify that the issues have been resolved. You should see:
           - A stable, low-level memory baseline in the memory graph.
           - No "Detached DOM tree" leaks in the heap snapshot comparison.
           - A significant reduction in long frames and expensive function calls in the performance profile.
           - A consistently responsive UI, even after many turns.
     - [ ] Final Regression Test:
       - Action: Run the entire test suite one last time (npm test).
       - Goal: Ensure that no part of the application's functionality was broken during the entire refactoring process.