// ---------------------------
// Data: Word bank (JSON-ish)
// ---------------------------
const wordBank = {
    "words": [
    {"word":"javascript","hint":"The language this game is written in"},
    {"word":"html","hint":"Markup language for the web"},
    {"word":"css","hint":"Stylesheet language for presentation"},
    {"word":"algorithm","hint":"Step-by-step recipe to solve a problem"},
    {"word":"variable","hint":"A named container for data"},
    {"word":"function","hint":"A reusable block of code"},
    {"word":"browser","hint":"Software used to access the web"},
    {"word":"debugging","hint":"Finding and fixing errors"},
    {"word":"framework","hint":"A platform for building apps"},
    {"word":"responsive","hint":"Adapts to different screen sizes"}
    ]
};

// ---------------------------
// State
// ---------------------------
let currentWord = "";
let scrambledWord = "";
let currentHint = "";
let score = 0;
let puzzlesSolved = 0;
let hintUsed = false;

// ---------------------------
// DOM
// ---------------------------
const scrambledWordEl = document.getElementById('scrambled-word');
const hintEl = document.getElementById('hint');
const messageEl = document.getElementById('message');
const guessInput = document.getElementById('guess-input');
const scoreEl = document.getElementById('score');
const solvedEl = document.getElementById('solved');
const nextBonusEl = document.getElementById('next-bonus');
const leaderboardListEl = document.getElementById('leaderboard-list');

// ---------------------------
// Utilities
// ---------------------------
function scrambleWord(word){
    const letters = word.split('');
    for(let i=letters.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

function showMessage(msg, type='danger'){
    messageEl.textContent = msg;
    messageEl.className = type === 'danger' ? 'danger' : 'success';
    // Clear success messages after a short time for better UX
    if(type !== 'danger'){
    setTimeout(()=>{ if(messageEl.className!=='danger') messageEl.textContent=''; }, 3000);
    }
}

function safeParse(json, fallback){
    try{ return JSON.parse(json); }catch{ return fallback; }
}

function updateNextBonusIndicator(){
    const remainder = puzzlesSolved % 3;
    const nextAt = remainder === 0 ? 3 : (3 - remainder);
    nextBonusEl.textContent = nextAt;
}

// ---------------------------
// Leaderboard
// ---------------------------
function getLeaderboard(){
    const raw = localStorage.getItem('leaderboard');
    const arr = safeParse(raw, []);
    return Array.isArray(arr) ? arr : [];
}

function setLeaderboard(arr){
    localStorage.setItem('leaderboard', JSON.stringify(arr));
}

function displayLeaderboard(list){
    if(!list || list.length === 0){
    leaderboardListEl.innerHTML = `<li class="muted">No scores yet — be the first!</li>`;
    return;
    }
    leaderboardListEl.innerHTML = list.map((s, i)=> `<li><strong>${s}</strong>${i===0?' 🥇': i===1?' 🥈': i===2?' 🥉':''}</li>`).join('');
}

function updateLeaderboard(currentScore){
    let leaderboard = getLeaderboard();
    leaderboard.push(currentScore);
    leaderboard.sort((a,b)=> b-a);
    leaderboard = leaderboard.slice(0,3);
    setLeaderboard(leaderboard);
    displayLeaderboard(leaderboard);
}

// ---------------------------
// Game core
// ---------------------------
function newPuzzle(){
    hintUsed = false;
    hintEl.textContent = '';
    messageEl.textContent = '';
    guessInput.value = '';

    // Pick a word at random
    const idx = Math.floor(Math.random()*wordBank.words.length);
    currentWord = wordBank.words[idx].word.toLowerCase();
    currentHint = wordBank.words[idx].hint;

    // Ensure scrambled is not identical to original
    let attempt = currentWord;
    let safety = 0;
    while(attempt === currentWord && safety < 20){
    attempt = scrambleWord(currentWord);
    safety++;
    }
    scrambledWord = attempt;
    scrambledWordEl.textContent = scrambledWord;
    scrambledWordEl.style.color = 'var(--primary)';
    updateNextBonusIndicator();
}

function checkGuess(){
    const guess = guessInput.value.trim().toLowerCase();
    if(!guess){
    showMessage("Please enter a guess!");
    return;
    }
    if(guess === currentWord){
    // Correct!
    let points = hintUsed ? 5 : 10; // direct solve vs with hint
    score += points;
    puzzlesSolved++;

    // Bonus: every 3 solved puzzles, double the score
    if (puzzlesSolved % 3 === 0){
        score *= 2;
        showMessage("🎉 Bonus Round! Score doubled!", "success");
    } else {
        showMessage(`Correct! +${points} points`, 'success');
    }

    // Reflect UI
    scoreEl.textContent = score;
    solvedEl.textContent = puzzlesSolved;
    updateNextBonusIndicator();

    // Update leaderboard after each correct solve
    updateLeaderboard(score);

    // Celebrate by flashing the solved word briefly
    scrambledWordEl.textContent = currentWord;
    scrambledWordEl.style.color = 'var(--success)';

    // Queue next puzzle
    setTimeout(newPuzzle, 1200);
    }else{
    showMessage("Incorrect, try again!");
    guessInput.select();
    }
}

function showHint(){
    if(!hintUsed){
    hintEl.textContent = currentHint;
    score = Math.max(0, score - 2); // immediate cost for hint
    scoreEl.textContent = score;
    hintUsed = true;
    showMessage("Hint shown (−2 points).", "success");
    }else{
    showMessage("You've already used your hint for this puzzle!");
    }
}

function resetGame(){
    score = 0;
    puzzlesSolved = 0;
    hintUsed = false;

    scoreEl.textContent = score;
    solvedEl.textContent = puzzlesSolved;
    updateNextBonusIndicator();

    messageEl.textContent = "Game reset!";
    messageEl.className = "success";
    scrambledWordEl.textContent = "";
    hintEl.textContent = "";
    guessInput.value = "";
    guessInput.focus();

    newPuzzle();
}

// ---------------------------
// Init
// ---------------------------
document.addEventListener('DOMContentLoaded', ()=>{
    // Wire up events
    document.getElementById('submit-guess').addEventListener('click', checkGuess);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('new-puzzle').addEventListener('click', newPuzzle);
    document.getElementById('reset-game').addEventListener('click', resetGame);
    guessInput.addEventListener('keypress', e => { if(e.key === 'Enter') checkGuess(); });

    // Load leaderboard
    displayLeaderboard(getLeaderboard());

    // First puzzle
    newPuzzle();
    guessInput.focus();
});

// ---------------------------
// Exports for testing
// ---------------------------
module.exports = {
    scrambleWord,
    showHint,
    checkGuess,
    newPuzzle,
    resetGame,
    puzzlesSolved,
    getLeaderboard,
    setLeaderboard,
    updateLeaderboard,
    wordBank,
    // State (for testing)
    get score(){ return score; },
    set score(v){ score = v; },
    get hintUsed(){ return hintUsed; },
    set hintUsed(v){ hintUsed = v; },
    get currentHint(){ return currentHint; },
    set currentHint(v){ currentHint = v; },
    get puzzlesSolved(){ return puzzlesSolved; },
    set puzzlesSolved(v){ puzzlesSolved = v; },
};
// -------------------------------------------
// End of file wordpuzzle.js
// -------------------------------------------  
