/* ============================================
   Neon Cursor + Typing Race + Floating Letters
   ============================================ */

// ===== Neon Cursor Background =====
const canvas = document.getElementById("neonCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "0";

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const trail = [];
window.addEventListener("mousemove", (e) => {
  trail.push({ x: e.clientX, y: e.clientY, life: 1 });
  if (trail.length > 120) trail.shift();
});

function animateTrail() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 25;
  ctx.shadowColor = "rgba(0,180,255,0.9)";
  ctx.strokeStyle = "#00bfff";

  if (trail.length > 1) {
    ctx.beginPath();
    for (let i = 0; i < trail.length - 1; i++) {
      const p1 = trail[i];
      const p2 = trail[i + 1];
      ctx.globalAlpha = p1.life;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      p1.life -= 0.018;
    }
    ctx.stroke();
  }
  while (trail.length && trail[0].life <= 0) trail.shift();
  requestAnimationFrame(animateTrail);
}
animateTrail();

// ===== Typing Game Logic =====
const textBank = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Hello world! This is a simple test."
  ],
  medium: [
    "Typing games help improve your keyboard accuracy and speed.",
    "Practice each keystroke like a racer training for speed."
  ],
  hard: [
    "Consistency and deliberate practice are crucial for typing mastery.",
    "Mindful rhythm and accuracy define great typists."
  ]
};

let currentDifficulty = "easy";
let currentText = "";
let startTime = null;
let timerInterval = null;
let typedChars = 0;
let correctChars = 0;
let totalChars = 0;
let prevInputValue = "";

const textDisplay = document.getElementById("text-display");
const inputField = document.getElementById("input-field");
const wpmDisplay = document.getElementById("wpm");
const accDisplay = document.getElementById("acc");
const timerDisplay = document.getElementById("timer");
const overlay = document.getElementById("overlay");
const finalWPM = document.getElementById("final-wpm");
const finalAcc = document.getElementById("final-acc");
const finalTime = document.getElementById("final-time");
const restartBtn = document.getElementById("restart-btn");
const newTextBtn = document.getElementById("new-text-btn");
const diffButtons = document.querySelectorAll(".diff-btn");

// Floating colored letters
function spawnFloatingLetter(char) {
  if (!char || char === " ") return;
  const span = document.createElement("span");
  span.className = "floating-letter";
  span.textContent = char;
  span.style.left = Math.random() * window.innerWidth + "px";
  span.style.top = window.innerHeight - 100 + "px";
  span.style.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  document.body.appendChild(span);
  setTimeout(() => span.remove(), 1400);
}

function updateStats() {
  const elapsed = Date.now() - startTime;
  timerDisplay.textContent = (elapsed / 1000).toFixed(2);
  const minutes = elapsed / 60000;
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  wpmDisplay.textContent = wpm;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  accDisplay.textContent = accuracy + "%";
}

function resetGame(newText = false) {
  clearInterval(timerInterval);
  inputField.value = "";
  typedChars = correctChars = 0;
  prevInputValue = "";

  if (newText || !currentText) {
    const list = textBank[currentDifficulty];
    currentText = list[Math.floor(Math.random() * list.length)];
  }
  totalChars = currentText.length;
  textDisplay.innerHTML = "";
  currentText.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "untyped";
    if (i === 0) span.classList.add("current");
    textDisplay.appendChild(span);
  });
  wpmDisplay.textContent = "0";
  accDisplay.textContent = "0%";
  timerDisplay.textContent = "0.00";
  inputField.focus();
}

function handleInput() {
  const val = inputField.value;
  if (val.length > prevInputValue.length) {
    const newChar = val[val.length - 1];
    spawnFloatingLetter(newChar);
  }
  prevInputValue = val;
  if (!startTime) {
    startTime = Date.now();
    timerInterval = setInterval(updateStats, 100);
  }

  typedChars = val.length;
  const spans = textDisplay.querySelectorAll("span");
  let newCorrect = 0;

  spans.forEach((span, i) => {
    const typedChar = val[i];
    span.className = "untyped";
    if (i < typedChars) {
      if (typedChar === currentText[i]) {
        span.className = "typed";
        newCorrect++;
      } else {
        span.className = "wrong";
      }
    } else if (i === typedChars) span.classList.add("current");
  });

  correctChars = newCorrect;
  if (typedChars === totalChars) {
    clearInterval(timerInterval);
    overlay.classList.add("show");
    finalWPM.textContent = wpmDisplay.textContent;
    finalAcc.textContent = accDisplay.textContent;
    finalTime.textContent = timerDisplay.textContent;
  }
}

inputField.addEventListener("input", handleInput);
restartBtn.addEventListener("click", () => {
  overlay.classList.remove("show");
  resetGame();
});
newTextBtn.addEventListener("click", () => {
  overlay.classList.remove("show");
  resetGame(true);
});
diffButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    diffButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentDifficulty = btn.dataset.diff;
    resetGame(true);
  })
);

window.addEventListener("load", () => {
  diffButtons[0].classList.add("selected");
  currentText = textBank[currentDifficulty][0];
  resetGame();
});
