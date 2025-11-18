const jellyCat = document.querySelector("#jellyCat");
const teaseBubble = document.querySelector("#jellyCatTease");
const message = document.querySelector("#message");
const confettiLayer = document.querySelector(".confetti");
const canvas = document.querySelector(".canvas");
const loadingScreen = document.querySelector(".loading-screen");
const startScreen = document.querySelector(".start-screen");
const startButton = document.querySelector("#startButton");

const TEASE_LIMIT = 10;
const TEASE_PROXIMITY = 90;
const ASSETS_TO_PRELOAD = ["jelly.png"];
const MIN_LOADING_MS = 1200;

const TEASE_LINES = [
  "Can't catch a jelly!",
  "Too slow! 🐾",
  "Maybe try cat treats?",
  "Nope, jelly ghosts out.",
  "You're getting warmer...",
  "Still here... somewhere!",
  "Jelly vanishes again!",
  "Almost! try again!",
  "I slip through paws like jelly!",
  "Did you just blink?",
  "Faster fingers please!",
  "Is that the best chase?",
  "Jelly hack: move like water!",
  "Mission jelly-impossible!",
  "Nice try, human!",
  "You'll need nine lives for this.",
  "Paws-itively untouchable!",
  "Guess again, whisker-buddy!",
  "Oops, wrong spot!",
  "Your cursor is adorable tho!",
];

let teaseCount = 0;
let teaseLineIndex = 0;
let isGameReady = false;
let hasStarted = false;
let hasCelebrated = false;
let loadingStartTime = null;

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

function preloadAssets() {
  if (!ASSETS_TO_PRELOAD.length) return Promise.resolve();
  return Promise.all(ASSETS_TO_PRELOAD.map(preloadImage));
}

function showLoadingScreen() {
  if (!loadingScreen) return;
  loadingScreen.classList.remove("loading-screen--gone");
  requestAnimationFrame(() => {
    loadingScreen.classList.remove("loading-screen--hidden");
  });
}

function hideLoadingScreen() {
  if (!loadingScreen) return;
  loadingScreen.classList.add("loading-screen--hidden");
  setTimeout(() => {
    loadingScreen.classList.add("loading-screen--gone");
  }, 260);
}

function dismissStartScreen() {
  if (!startScreen) return;
  startScreen.classList.add("start-screen--hidden");
  setTimeout(() => startScreen.classList.add("start-screen--gone"), 300);
}

function markGameReady() {
  isGameReady = true;
  jellyCat?.classList.add("jelly-cat--ready");
  canvas?.setAttribute("aria-busy", "false");
}

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
  if (!isGameReady || hasCelebrated) return;
  if (teaseCount >= TEASE_LIMIT) {
    scheduleCelebrate();
    return;
  }
  if (jellyCat?.classList.contains("jelly-cat--teasing")) return;
  teaseCount += 1;
  teaseCharacter();
  event?.preventDefault?.();
  event?.stopPropagation?.();

  if (teaseCount >= TEASE_LIMIT) {
    scheduleCelebrate();
  }
}

function celebrate() {
  if (!isGameReady || hasCelebrated) return;
  hasCelebrated = true;
  resetCharacterPosition();
  jellyCat?.classList.add("jelly-cat--settled");
  showTeaseLine("Fine, you win!");
  message?.classList.add("message--active");
  message?.setAttribute("aria-hidden", "false");
  launchConfetti();
}

function scheduleCelebrate() {
  if (hasCelebrated) return;
  if (jellyCat?.classList.contains("jelly-cat--teasing")) {
    setTimeout(scheduleCelebrate, 80);
    return;
  }
  celebrate();
}

jellyCat?.addEventListener("mouseenter", handleTease);
jellyCat?.addEventListener("focus", handleTease);

jellyCat?.addEventListener("click", (event) => {
  if (hasCelebrated) return;
  if (teaseCount < TEASE_LIMIT) {
    handleTease(event);
    return;
  }

  scheduleCelebrate();
});

jellyCat?.addEventListener("pointerenter", handleTease);

jellyCat?.addEventListener("keydown", (event) => {
  if (hasCelebrated) return;
  const isActivateKey = event.key === "Enter" || event.key === " ";
  if (!isActivateKey) return;

  event.preventDefault();
  if (teaseCount < TEASE_LIMIT) {
    handleTease(event);
    return;
  }

  scheduleCelebrate();
});

canvas?.addEventListener("pointermove", (event) => {
  if (!jellyCat || !isGameReady || hasCelebrated || teaseCount >= TEASE_LIMIT)
    return;

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

function beginGame() {
  if (hasStarted) return;
  hasStarted = true;
  startButton?.setAttribute("disabled", "true");
  dismissStartScreen();
  showLoadingScreen();
  canvas?.setAttribute("aria-busy", "true");
  loadingStartTime = performance.now();

  preloadAssets()
    .catch(() => {
      // Even if preloading fails, allow the game to start instead of blocking the user.
    })
    .finally(() => {
      const elapsed = performance.now() - (loadingStartTime ?? 0);
      const delay = Math.max(MIN_LOADING_MS - elapsed, 0);

      setTimeout(() => {
        markGameReady();
        hideLoadingScreen();
      }, delay);
    });
}

startButton?.addEventListener("click", beginGame);
