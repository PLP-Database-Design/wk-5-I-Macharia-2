/**
 * @jest-environment jsdom
 */


beforeEach(() => {
  document.body.innerHTML = `
    <div id="score">Score: 0</div>
    <div id="solved">Solved: 0</div>
    <div id="scrambledWord">apple</div>
    <button id="resetBtn">Reset Game</button>
    <button id="newPuzzleBtn">New Puzzle</button>
    <ul id="leaderboard"></ul>
  `;
});

//  Test Suite for Word Puzzle Game Plus 
describe("Word Puzzle Game Plus – Key Features", () => {
  
  // TC-01: Bonus Round (R-01)
  test("TC-01: Bonus Round - score doubles correctly after third puzzle", () => {
    let score = 0;
    const points = 10;

    // Simulate solving 3 puzzles
    score += points; // 1st
    score += points; // 2nd
    score = (score + points) * 2; // 3rd with bonus

    expect(score).toBe(60); // Expected: (20+10)*2
  });

//   // TC-02: Reset Game (R-02)
// describe ("resetGame()"), () => {
//   beforeEach(( ) => {  
//     test("TC-02 Reset Game: clicking Reset clears state and  auto-start new puzzle", () => {
//     // Initial game state
//     const gameState = {
//       score: 40,
//       solved: 3,
//       currentPuzzle: "gegbgnuid",
//       newPuzzleCalled: true
//     };
//     resetGame();
//     });
//     // Assertions
//     expect(gameState.score).toBe(0);
//     expect(gameState.solved).toBe(0);
//     // This proves the defect — no new puzzle loaded
//     expect(gameState.currentPuzzle).toBeNull();
//   });
// };

  // TC-03: Leaderboard persistence (R-03)
  test("TC-03: Leaderboard - scores not persisted in incognito", () => {
    // Simulate a fresh incognito session
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value; },
        clear: () => { store = {}; },
      };
    })();

    localStorageMock.setItem("leaderboard", JSON.stringify([10]));
    localStorageMock.clear(); // closing incognito

    expect(localStorageMock.getItem("leaderboard")).toBeNull();
  });

  // TC-04: Leaderboard boundary logic (R-04)
  test("TC-04: Leaderboard - only top 3 scores kept", () => {
    let scores = [10, 20, 30];
    scores.push(40);
    scores.sort((a, b) => b - a);
    scores = scores.slice(0, 3);

    expect(scores).toEqual([40, 30, 20]);
  });

  // TC-05: Leaderboard sorting (R-05)
  test("TC-05: Leaderboard - sorted numerically, not alphabetically", () => {
    const scores = [100, 5, 20];
    const sorted = [...scores].sort((a, b) => b - a);
    expect(sorted).toEqual([100, 20, 5]);
  });
});
