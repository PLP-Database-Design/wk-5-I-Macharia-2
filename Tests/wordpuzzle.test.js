require ('@testing-library/jest-dom')

const { waitFor } = require('@testing-library/dom');

// Set up the HTML structure
document.body.innerHTML = `
    <div id="score">0</div>
    <div id="solved">0</div>
    <div id="message"></div>
    <div id="scrambled-word"></div>
    <div id="hint"></div>
    <div id="next-bonus">3</div>
    <input type="text" id="guess-input" />
    <button id="submit-guess">Submit Guess</button>
    <button id="hint-btn">Show Hint</button>
    <button id="new-puzzle">New Puzzle</button>
    <button id="reset-game">Reset Game</button>
    <div id="leaderboard"></div>
`;

// Mock localstorage
global.localstorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    clear() {
        this.data = {};
    }
};

// Prevent DOMContentLoaded from firing during module load.
const originalAddEventListener = document.addEventListener;
document.addEventListener = function(event, callback) {
    if (event === 'DOMContentLoaded') {
        originalAddEventListener.call(document, event, callback);
    }
};

// Prevent auto initialization during import
document.addEventListener = jest.fn();


// Read the script file
const Script = require("./wordpuzzle.js");

// Test showHint function
describe("showHint()",() => {
    beforeEach(() => {
    // Reset  DOM elements
        document.getElementById('hint').textContent = '';
        document.getElementById('score').textContent = '10';
        document.getElementById('message').textContent =  '';
        // Initialize game state
        Script.score = 10;
        Script.hintUsed = false;
        Script.currentHint = "This is a hint.";
    });
    test("shows hint and deducts points on first use", () => {
        Script.showHint();
        expect(document.getElementById('hint').textContent).toBe("This is a hint.");
        expect(Script.score).toBe(8); // 10 - 2
        expect(Script.hintUsed).toBe(true);
    });
    test("does not deduct points on subsequent uses", () => {
        Script.hintUsed = true;
        Script.showHint();
        expect(document.getElementById('hint').textContent).toBe(""); // No change
        expect(Script.score).toBe(10); // No deduction
    });
});

// Test resetGame function
describe("resetGame()", () => {
    beforeEach(( ) => {
        // Set some initial state
        Script.score = 15;
        Script.puzzlesSolved = 2;
        Script.hintUsed = true;
        // Reset  DOM elements
        document.getElementById('score').textContent = '15';
        document.getElementById('solved').textContent = '2';
        document.getElementById('message').textContent = 'Some message';
        document.getElementById('scrambled-word').textContent = 'scrambled';
        document.getElementById('hint').textContent = 'Some hint';
        document.getElementById('guess-input').value = 'some guess';
        

    });
    test("resets score, puzzles solved, and hint used", () => {
        Script.resetGame();
        expect(Script.score).toBe(0);
        expect(Script.puzzlesSolved).toBe(0);
        expect(Script.hintUsed).toBe(false);
    });
    // test("updates DOM elements accordingly", () => {
    //     Script.resetGame();
    //     expect(document.getElementById('score').textContent).toBe('0');
    //     expect(document.getElementById('solved').textContent).toBe('0');
    //     expect(document.getElementById('message').textContent).toBe('Game reset!');
    //     expect(document.getElementById('message').className).toBe('success');
    //     expect(document.getElementById('scrambled-word').textContent).toBe('');
    //     expect(document.getElementById('hint').textContent).toBe('');
    //     expect(document.getElementById('guess-input').value).toBe('');

    // });


// Test New puzzle is triggered after reset Game is triggered
    test("triggers new puzzle setup", async () => {
        const newPuzzleSpy = jest.spyOn(Script, 'newPuzzle');

        Script.resetGame();

        await waitFor(() => {
            expect(newPuzzleSpy).toHaveBeenCalledTimes(1);
        });

        newPuzzleSpy.mockRestore();
    });

    test("updates DOM elements accordingly", () => {
        Script.resetGame();

        expect(document.getElementById('score').textContent).toBe('0');
        expect(document.getElementById('solved').textContent).toBe('0');

        // New puzzle means scrambled word should not be empty
        expect(document.getElementById('scrambled-word').textContent)
            .not.toBe("");

        // Hint always starts empty
        expect(document.getElementById('hint').textContent).toBe("");

        // Input cleared
        expect(document.getElementById('guess-input').value).toBe("");
    });
});