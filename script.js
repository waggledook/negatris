const wordToPrefix = {
  "responsible": "ir-",
  "thoughtful": "un-",
  "polite": "im-",
  "patient": "im-",
  "correct": "in-",
  "respectful": "dis-",
  "advantage": "dis-",
  "relevant": "ir-",
  "faithful": "un-",
  "perfect": "im-",
  "usual": "un-",
  "rational": "ir-",
  "loyal": "dis-",
  "like": "dis-",
  "honest": "dis-",
  "mortal": "im-",
  "possible": "im-",
  "separable": "in-",
  "resistible": "ir-",
  "comfortable": "un-",
  "happy": "un-",
  "informed": "un-",
  "helpful": "un-",
  "healthy": "un-",
  "real": "un-",
  "fair": "un-",
  "considerate": "in-",
  "agreement": "dis-",
  "thinkable": "un-",
  "legal": "il-",
  "mature": "im-",
  "literate": "il-",
  "fortunate": "un-",
  "logical": "il-",
  "moral": "im-",
  "practical": "im-",
  "safe": "un-",
  "surprising": "un-",
  "tidy": "un-",
  "regular": "ir-",
  "legitimate": "il-",
  "attractive": "un-",
  "appropriate": "in-",
  "mobile": "im-",
  "hospitable": "in-",
  "personal": "im-",
  "embark": "dis-",
  "official": "un-",
  "easy": "un-",
  "coherent": "in-",
  "continue": "dis-",
  "replaceable": "ir-",
  "capable": "in-",
  "do": "un-",
  "competent": "in-"
};

const uniquePrefixes = ["un-", "in-", "dis-", "im-", "ir-", "il-"];

const wordDisplay = document.getElementById("word-display");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const mistakesDisplay = document.getElementById("mistakes");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

let score = 0;
let activeWords = [];
let gameInterval;
let timerInterval;
let timeRemaining = 120; // 2 minutes
let mistakes = [];

function createFallingWord() {
  const words = Object.keys(wordToPrefix);
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const correctPrefix = wordToPrefix[randomWord];

  const wordElement = document.createElement("div");
  wordElement.className = "falling-word";
  wordElement.textContent = randomWord;
  wordElement.dataset.correctPrefix = correctPrefix;
  wordElement.dataset.processed = "false";

  wordElement.style.left = `${Math.random() * 70 + 5}%`; // Range: 5% to 75%
  wordElement.style.top = `0px`;
  wordDisplay.appendChild(wordElement);

  activeWords.push(wordElement);

  let fallInterval = setInterval(() => {
    const currentTop = parseFloat(wordElement.style.top) || 0;
    wordElement.style.top = `${currentTop + 2}px`;

    if (currentTop >= wordDisplay.clientHeight - 50) {
      clearInterval(fallInterval);
      handleMissedWord(wordElement);
    }
  }, 20);
}

function removeWord(wordElement) {
  const index = activeWords.indexOf(wordElement);
  if (index !== -1) {
    activeWords.splice(index, 1);
  }
  wordDisplay.removeChild(wordElement);
}

function handleMissedWord(wordElement) {
  if (wordElement.dataset.processed === "true") return;
  mistakes.push(`${wordElement.textContent} → ${wordElement.dataset.correctPrefix}`);
  score -= 5;
  updateScore();
  removeWord(wordElement);
}

function checkCollision(wordElement, bucket) {
  if (wordElement.dataset.processed === "true") return;

  const correctPrefix = wordElement.dataset.correctPrefix;
  const bucketPrefix = bucket.dataset.prefix;

  if (bucketPrefix === correctPrefix) {
    score += 10;
  } else {
    mistakes.push(`${wordElement.textContent} → ${correctPrefix}`);
    score -= 5;
  }

  wordElement.dataset.processed = "true";
  updateScore();
  removeWord(wordElement);
}

function detectCollisions() {
  const buckets = document.querySelectorAll(".bucket");

  activeWords.forEach(wordElement => {
    const wordRect = wordElement.getBoundingClientRect();

    buckets.forEach(bucket => {
      const bucketRect = bucket.getBoundingClientRect();

      const overlapWidth = Math.min(wordRect.right, bucketRect.right) - Math.max(wordRect.left, bucketRect.left);
      const wordWidth = wordRect.right - wordRect.left;

      if (
        wordRect.bottom >= bucketRect.top &&
        overlapWidth > 0 &&
        overlapWidth / wordWidth >= 0.5
      ) {
        checkCollision(wordElement, bucket);
      }
    });
  });
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function startGame() {
  resetGame();
  startButton.style.display = "none";
  restartButton.style.display = "none";

  timerInterval = setInterval(updateTimer, 1000);
  gameInterval = setInterval(createFallingWord, 2000);
  setInterval(detectCollisions, 50);
}

function updateTimer() {
  timeRemaining--;
  timerDisplay.textContent = `Time: ${timeRemaining}s`;

  if (timeRemaining <= 0) {
    endGame();
  }
}

function endGame() {
  clearInterval(timerInterval);
  clearInterval(gameInterval);
  activeWords.forEach(word => removeWord(word));
  activeWords = [];
  displayMistakes();
  restartButton.style.display = "block";
}

function resetGame() {
  score = 0;
  timeRemaining = 120;
  mistakes = [];
  updateScore();
  timerDisplay.textContent = `Time: ${timeRemaining}s`;
  mistakesDisplay.innerHTML = "";
}

function displayMistakes() {
  if (mistakes.length === 0) {
    mistakesDisplay.innerHTML = "<p>No mistakes! Well done!</p>";
  } else {
    mistakesDisplay.innerHTML = `<h3>Mistakes:</h3><ul>${mistakes
      .map(m => `<li>${m}</li>`)
      .join("")}</ul>`;
  }
}

// Allow words to be moved left and right using the arrow keys
document.addEventListener("keydown", (e) => {
  const allowedKeys = ["ArrowLeft", "ArrowRight"];
  if (!allowedKeys.includes(e.key)) return;

  activeWords.forEach(wordElement => {
    const currentLeft = parseFloat(wordElement.style.left) || 0;

    if (e.key === "ArrowLeft") {
      const newLeft = currentLeft - 5;
      wordElement.style.left = newLeft < 0 ? `95%` : `${newLeft}%`;
    } else if (e.key === "ArrowRight") {
      const newLeft = currentLeft + 5;
      wordElement.style.left = newLeft > 95 ? `0%` : `${newLeft}%`;
    }
  });
});

// Initialize the game
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// Setup initial state
restartButton.style.display = "none";
resetGame();
