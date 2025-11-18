const jellyCat = document.querySelector("#jellyCat");
const teaseBubble = document.querySelector("#jellyCatTease");
const message = document.querySelector("#message");
const confettiLayer = document.querySelector(".confetti");
const canvas = document.querySelector(".canvas");

const TEASE_LIMIT = 6;
const TEASE_PROXIMITY = 90;
const TEASE_LINES = [
  "Can't catch a jelly!",
  "Too slow! 🐾",
  "Maybe try cat treats?",
  "Nope, jelly ghosts out.",
  "You're getting warmer...",
  "Still here... somewhere!",
  "Jelly vanishes again!",
  "Almost! try again!",
];
let teaseCount = 0;
let teaseLineIndex = 0;
function launchConfetti() {
  if (!confettiLayer) return;

  const colors = ["#ff6f91", "#ff9671", "#ffd166", "#88e1f2"];
  const amount = 40;

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    const colorA = colors[Math.floor(Math.random() * colors.length)];
    const colorB = colors[Math.floor(Math.random() * colors.length)];
    piece.style.background = `linear-gradient(180deg, ${colorA}, ${colorB})`;
    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), 3000);
  }
}

function showTeaseLine(line) {
  if (!teaseBubble) return;
  teaseBubble.textContent = line;
  teaseBubble.classList.add("jelly-cat__tease--visible");
}

function hideTeaseLine() {
  teaseBubble?.classList.remove("jelly-cat__tease--visible");
}

function getNextTeaseLine() {
  const line = TEASE_LINES[teaseLineIndex];
  teaseLineIndex = (teaseLineIndex + 1) % TEASE_LINES.length;
  return line;
}

function teaseCharacter() {
  if (!jellyCat || !canvas) return;

  const canvasRect = canvas.getBoundingClientRect();
  const catRect = jellyCat.getBoundingClientRect();
  const maxX = Math.max(canvasRect.width - catRect.width, 0);
  const maxY = Math.max(canvasRect.height - catRect.height, 0);
  const offsetX = Math.random() * maxX;
  const offsetY = Math.random() * maxY;

  jellyCat.classList.add("jelly-cat--teasing");
  jellyCat.style.position = "absolute";
  jellyCat.style.left = `${offsetX}px`;
  jellyCat.style.top = `${offsetY}px`;

  showTeaseLine(getNextTeaseLine());

  setTimeout(() => jellyCat.classList.remove("jelly-cat--teasing"), 140);
}

function resetCharacterPosition() {
  if (!jellyCat) return;
  jellyCat.style.position = "";
  jellyCat.style.left = "";
  jellyCat.style.top = "";
}

function handleTease(event) {
  if (teaseCount >= TEASE_LIMIT) return;
  if (jellyCat?.classList.contains("jelly-cat--teasing")) return;
  teaseCount += 1;
  teaseCharacter();
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

function celebrate() {
  resetCharacterPosition();
  jellyCat?.classList.add("jelly-cat--settled");
  showTeaseLine("Fine, you win!");
  message?.classList.add("message--active");
  message?.setAttribute("aria-hidden", "false");
  launchConfetti();
}

jellyCat?.addEventListener("mouseenter", handleTease);
jellyCat?.addEventListener("focus", handleTease);

jellyCat?.addEventListener("click", (event) => {
  if (teaseCount < TEASE_LIMIT) {
    handleTease(event);
    return;
  }

  celebrate();
});

jellyCat?.addEventListener("pointerenter", handleTease);

jellyCat?.addEventListener("keydown", (event) => {
  const isActivateKey = event.key === "Enter" || event.key === " ";
  if (!isActivateKey) return;

  event.preventDefault();
  if (teaseCount < TEASE_LIMIT) {
    handleTease(event);
    return;
  }

  celebrate();
});

canvas?.addEventListener("pointermove", (event) => {
  if (!jellyCat || teaseCount >= TEASE_LIMIT) return;

  const catRect = jellyCat.getBoundingClientRect();
  const nearX =
    event.clientX >= catRect.left - TEASE_PROXIMITY &&
    event.clientX <= catRect.right + TEASE_PROXIMITY;
  const nearY =
    event.clientY >= catRect.top - TEASE_PROXIMITY &&
    event.clientY <= catRect.bottom + TEASE_PROXIMITY;

  if (nearX && nearY) {
    handleTease();
  }
});
