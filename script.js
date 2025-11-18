const jellyCat = document.querySelector("#jellyCat");
const teaseBubble = document.querySelector("#jellyCatTease");
const message = document.querySelector("#message");
const confettiLayer = document.querySelector(".confetti");
const canvas = document.querySelector(".canvas");
const loadingScreen = document.querySelector(".loading-screen");
const startScreen = document.querySelector(".start-screen");
const startButton = document.querySelector("#startButton");
const cakeSection = document.querySelector("#cakeSection");
const cakeButton = document.querySelector("#cakeButton");
const cakeMessage = document.querySelector("#cakeMessage");
const letterSection = document.querySelector("#letterSection");
const letterTextElement = document.querySelector("#letterText");
const letterCursor = document.querySelector("#letterCursor");
const bodyElement = document.body;

function enterFullscreen() {
  const root = document.documentElement;
  if (!root) return;

  const request =
    root.requestFullscreen ||
    root.webkitRequestFullscreen ||
    root.msRequestFullscreen ||
    root.mozRequestFullScreen;

  if (request) {
    try {
      const result = request.call(root);
      if (result instanceof Promise) {
        result.catch(() => {});
      }
    } catch {
      // Ignore fullscreen errors to avoid breaking flow.
    }
  }
}

const TEASE_LIMIT = 10;
const TEASE_PROXIMITY = 90;
const ASSETS_TO_PRELOAD = ["jelly.png"];
const MIN_LOADING_MS = 1200;
const CAKE_ANIMATION_DURATION = 1500;
const LETTER_TEXT = `Chúc mừng sinh nhật em.
Anh không biết phải diễn tả thế nào cho thật hoàn hảo, nhưng sự xuất hiện của em đã khiến cuộc sống của anh thay đổi theo những cách mà có lẽ em sẽ chẳng bao giờ hiểu hết.

Trong ngày đặc biệt này, anh chỉ muốn em biết rằng:
Em xứng đáng nhận được tất cả yêu thương, bình yên và hạnh phúc trên thế gian này.
Anh mong năm nay sẽ mang đến cho em những khoảnh khắc khiến trái tim em mỉm cười, những ước mơ trở thành hiện thực, và những người thật sự trân trọng em như em xứng đáng được nhận.

Cảm ơn em vì chính con người em — dịu dàng, tốt bụng, quan tâm và vô cùng đặc biệt.
Anh thật sự biết ơn vì chúng ta đã gặp nhau.
Dù xa hay gần, anh vẫn luôn ở đây, âm thầm ủng hộ và mong em hạnh phúc.

Chúc mừng sinh nhật em… Anh hy vọng hôm nay sẽ đặc biệt như chính em vậy.”

~seven`;
const LETTER_TYPE_DELAY = 35;
const LETTER_SCROLL_DELAY = 600;

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
let cakeStage = 0;
const MAX_CAKE_STAGE = 3;
let isCakeCutting = false;
let isLetterStarted = false;
function enableLetterOverlay() {
  if (bodyElement) {
    bodyElement.classList.add("letter-mode");
  }
  if (letterSection) {
    letterSection.classList.add("letter--overlay");
  }
}

function disableLetterOverlay() {
  if (bodyElement) {
    bodyElement.classList.remove("letter-mode");
  }
  if (letterSection) {
    letterSection.classList.remove("letter--overlay");
  }
}


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
  if (jellyCat) {
    jellyCat.classList.add("jelly-cat--ready");
  }
  if (canvas) {
    canvas.setAttribute("aria-busy", "false");
  }
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
  if (teaseBubble) {
    teaseBubble.classList.remove("jelly-cat__tease--visible");
  }
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
  const bubbleRect = teaseBubble ? teaseBubble.getBoundingClientRect() : null;
  const bubbleHeight =
    bubbleRect && typeof bubbleRect.height === "number"
      ? bubbleRect.height
      : 50;
  const safeTopPadding = bubbleHeight + 16;
  const offsetX = Math.random() * maxX;
  const offsetY = Math.random() * (maxY - safeTopPadding) + safeTopPadding;

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
  if (jellyCat && jellyCat.classList.contains("jelly-cat--teasing")) return;
  teaseCount += 1;
  teaseCharacter();
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (teaseCount >= TEASE_LIMIT) {
    scheduleCelebrate();
  }
}

function celebrate() {
  if (!isGameReady || hasCelebrated) return;
  hasCelebrated = true;
  resetCharacterPosition();
  if (jellyCat) {
    jellyCat.classList.add("jelly-cat--settled");
  }
  showTeaseLine("Fine, you win!");
  if (message) {
    message.classList.add("message--active");
    message.setAttribute("aria-hidden", "false");
  }
  launchConfetti();
  revealCake();
}

function scheduleCelebrate() {
  if (hasCelebrated) return;
  if (jellyCat && jellyCat.classList.contains("jelly-cat--teasing")) {
    setTimeout(scheduleCelebrate, 80);
    return;
  }
  celebrate();
}

function revealCake() {
  if (cakeSection) {
    cakeSection.classList.add("cake--ready");
    cakeSection.setAttribute("aria-hidden", "false");
    cakeSection.classList.remove(
      "cake--stage1-done",
      "cake--stage2-done",
      "cake--stage3-done",
      "cake--cut-stage1",
      "cake--cut-stage2",
      "cake--cut-stage3"
    );
  }
  if (canvas) {
    canvas.classList.add("canvas--with-cake");
  }
  if (cakeButton) {
    cakeButton.removeAttribute("disabled");
    cakeButton.textContent = "Cut the Cake";
  }
  if (letterSection) {
    letterSection.classList.add("letter--hidden");
    letterSection.classList.remove("letter--visible");
  }
  if (letterTextElement) {
    letterTextElement.innerHTML = "";
  }
  if (letterCursor) {
    letterCursor.classList.remove("letter__cursor--done");
  }
  if (cakeMessage) {
    cakeMessage.textContent = "";
    cakeMessage.classList.remove("cake__message--visible");
    cakeMessage.setAttribute("aria-hidden", "true");
  }
  cakeStage = 0;
  isCakeCutting = false;
  isLetterStarted = false;
  disableLetterOverlay();
}

function handleCakeCut() {
  if (!cakeSection || isCakeCutting || cakeStage >= MAX_CAKE_STAGE) return;

  cakeStage += 1;
  isCakeCutting = true;
  const stageClass = `cake--cut-stage${cakeStage}`;
  cakeSection.classList.add(stageClass);
  if (cakeButton) {
    cakeButton.setAttribute("disabled", "true");
    cakeButton.textContent = "Slicing...";
  }
  const currentStage = cakeStage;

  setTimeout(() => {
    if (!cakeSection) return;
    cakeSection.classList.remove(stageClass);
    cakeSection.classList.add(`cake--stage${currentStage}-done`);

    if (currentStage < MAX_CAKE_STAGE) {
      if (cakeButton) {
        cakeButton.removeAttribute("disabled");
        cakeButton.textContent =
          currentStage === 1 ? "Cut another slice" : "Final slice";
      }
    } else {
      if (cakeButton) {
        cakeButton.textContent = "Cake finished";
        cakeButton.setAttribute("disabled", "true");
      }
      if (cakeMessage) {
        cakeMessage.textContent =
          "Sorry, cake is finished—you ate a lot already!";
        cakeMessage.classList.add("cake__message--visible");
        cakeMessage.setAttribute("aria-hidden", "false");
      }
      setTimeout(startLetterReveal, 800);
    }
    isCakeCutting = false;
  }, CAKE_ANIMATION_DURATION);
}

function startLetterReveal() {
  if (isLetterStarted) return;
  isLetterStarted = true;
  enableLetterOverlay();

  if (letterSection) {
    letterSection.classList.remove("letter--hidden");
    requestAnimationFrame(() => {
      letterSection.classList.add("letter--visible");
    });
  }

  if (letterTextElement) {
    letterTextElement.innerHTML = "";
  }
  if (letterCursor) {
    letterCursor.classList.remove("letter__cursor--done");
  }

  setTimeout(() => {
    if (letterSection && !bodyElement?.classList.contains("letter-mode")) {
      letterSection.scrollIntoView({ behavior: "smooth" });
    }
  }, LETTER_SCROLL_DELAY);

  typeLetterCharacter(0);
}

function typeLetterCharacter(index) {
  if (!letterTextElement) return;
  if (index >= LETTER_TEXT.length) {
    if (letterCursor) {
      letterCursor.classList.add("letter__cursor--done");
    }
    return;
  }

  const char = LETTER_TEXT[index];
  if (char === "\n") {
    letterTextElement.innerHTML += "<br />";
  } else {
    letterTextElement.innerHTML += char;
  }

  setTimeout(() => typeLetterCharacter(index + 1), LETTER_TYPE_DELAY);
}

jellyCat && jellyCat.addEventListener("mouseenter", handleTease);
jellyCat && jellyCat.addEventListener("focus", handleTease);

jellyCat &&
  jellyCat.addEventListener("click", (event) => {
    if (hasCelebrated) return;
    if (teaseCount < TEASE_LIMIT) {
      handleTease(event);
      return;
    }

    scheduleCelebrate();
  });

jellyCat && jellyCat.addEventListener("pointerenter", handleTease);

jellyCat &&
  jellyCat.addEventListener("keydown", (event) => {
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

if (canvas) {
  canvas.addEventListener("pointermove", (event) => {
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
}

function beginGame() {
  if (hasStarted) return;
  hasStarted = true;
  enterFullscreen();
  if (startButton) {
    startButton.setAttribute("disabled", "true");
  }
  dismissStartScreen();
  showLoadingScreen();
  if (canvas) {
    canvas.setAttribute("aria-busy", "true");
  }
  loadingStartTime = performance.now();

  preloadAssets()
    .catch(() => {
      // Even if preloading fails, allow the game to start instead of blocking the user.
    })
    .finally(() => {
      const elapsed =
        performance.now() - (loadingStartTime !== null ? loadingStartTime : 0);
      const delay = Math.max(MIN_LOADING_MS - elapsed, 0);

      setTimeout(() => {
        markGameReady();
        hideLoadingScreen();
      }, delay);
    });
}

if (startButton) {
  startButton.addEventListener("click", beginGame);
}

if (cakeButton) {
  cakeButton.addEventListener("click", handleCakeCut);
}

