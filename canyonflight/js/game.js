// DB Api: https://supabase.com/
const SUPABASE_URL = "https://gcjwjjfajvmraxjokhoh.supabase.co";
const SUPABASE_KEY = "sb_publishable_-VOW-uAt6oJOmTBb_6z4Fg_ThcQxkl0";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Canyon Flight – Spiellogik =====
// Steuerung bewusst auf EIN Eingabe-Event reduziert (Flap),
// dadurch funktionieren Maus-Klick, Tastatur und Touch identisch.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBtn = document.getElementById("overlayBtn");
const saveScoreBtn = document.getElementById("saveScoreBtn");

// ---- Sound ----
const bgMusic = new Audio("./sounds/canyon_flight_bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

const fallSound = new Audio("./sounds/char_fall_down.mp3");
fallSound.volume = 0.7;

// ---- Konstanten ----
const W = canvas.width;
const H = canvas.height;

const BIRD_X = 70;
const BIRD_RADIUS = 14;
const GRAVITY = 0.45;
const FLAP_VELOCITY = -7.6;
const BASE_SPEED = 2.6;
const MAX_SPEED_BONUS = 2.4;
const PIPE_WIDTH = 56;
const SPAWN_DISTANCE = 220;
const HIGHSCORE_KEY = "canyonflight_highscore";

// ---- Spielzustand ----
let gameState = "ready"; // ready | playing | gameover
let birdY = H / 2;
let birdVelocity = 0;
let rotation = 0;
let obstacles = [];
let score = 0;
let lastScore = 0;
let highscore = 0;
let speed = BASE_SPEED;
let gameOverTime = 0;
let lastTimestamp = 0;
let wingPhase = 0;

// Fixe Sternpositionen für den Hintergrund (einmalig berechnet)
const stars = Array.from({ length: 28 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H * 0.6,
  r: Math.random() * 1.4 + 0.4,
}));

highscoreEl.textContent = highscore;

async function setHighestScore(){
  const { data, error } = await supabaseClient
    .from("highscores")
    .select("name, points")
    .eq("game", "canyonflight")
    .order("points", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Fehler beim Laden:", error.message);
    highscoreEl.textContent =
      'error loading';
    return;
  }

  highscoreEl.textContent = data[0].points;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function circleRectCollide(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

function spawnObstacle(x) {
  const gapHeight = 145 - Math.min(score * 1.5, 35); // wird mit der Zeit etwas enger
  const margin = 60;
  const gapY = margin + Math.random() * (H - margin * 2 - gapHeight);
  obstacles.push({ x, gapY, gapHeight, passed: false });
}

function resetGame() {
  birdY = H / 2;
  birdVelocity = 0;
  rotation = 0;
  obstacles = [];
  score = 0;
  speed = BASE_SPEED;
  scoreEl.textContent = "0";
  spawnObstacle(W + 100);
}

function startGame() {
  resetGame();
  gameState = "playing";
  saveScoreBtn.classList.add("d-none");
  overlay.classList.add("d-none");

  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {
    // Browser kann Autoplay vor einer Nutzer-Interaktion blockieren – hier kein Fehler nötig
  });
}

function flap() {
  birdVelocity = FLAP_VELOCITY;
}

function handleInput() {
  if (gameState === "ready") {
    startGame();
    flap();
  } else if (gameState === "playing") {
    flap();
  } else if (gameState === "gameover") {
    if (Date.now() - gameOverTime > 400) {
      startGame();
      flap();
    }
  }
}

function showGameOverModal(punkte) {
  const modal = document.getElementById("gameOverModal");
  const input = document.getElementById("nameInput");
  const errorMsg = document.getElementById("nameError");

  document.getElementById("modalScore").textContent = punkte;
  input.value = "";
  errorMsg.style.display = "none";
  modal.style.display = "flex";
  setTimeout(() => input.focus(), 100);

  document.getElementById("canyonflight_modalSaveBtn").onclick = async () => {
    let name = sanitizeName(input.value) || "";

    if (!name) {
      errorMsg.style.display = "block";
      return;
    }

    if (containsBlockedWord(name)) {
      name = "???";
    }

    modal.style.display = "none";
    saveScoreBtn.classList.add("d-none");
    await saveHighscore(name, punkte);
    await loadHighscores();
    await setHighestScore();
  };
}

// Eingabe live filtern (nur einmal registrieren, nicht bei jedem Modal-Öffnen)
document.getElementById("nameInput").addEventListener("input", (e) => {
  e.target.value = sanitizeName(e.target.value);
});

function sanitizeName(input) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 6);
}

const BLOCKLIST = [
  // Deutsch
  "FICKEN", "FICKT",  "SCHEIS", "FOTZE",  "HURENS",
  "WICHSE", "WICHST", "ARSCHL", "KACKE",  "PENNIS",
  "VAGINA", "NUTTEN", "HUREN",  "SCHLAMM",
  // Englisch
  "FUCKYО", "FUCKOF", "FUCKER", "BITCH",  "ASSHO",
  "PUSSY",  "CUNT",   "NIGGER", "FAGGOT", "RETARD",
  "WHORE",  "SLUT",   "BASTRD", "DICKHE",
];

function containsBlockedWord(name) {
  return BLOCKLIST.some((w) => name.includes(w));
}

async function saveHighscore(name, points) {
  const { error } = await supabaseClient
    .from("highscores")
    .insert({ name, points, game: "canyonflight" });

  if (error) {
    console.error("Fehler beim Speichern:", error.message);
  }
}

async function loadHighscores() {
  const { data, error } = await supabaseClient
    .from("highscores")
    .select("name, points")
    .eq("game", "canyonflight")
    .order("points", { ascending: false })
    .limit(10);

  const tableBody = document.querySelector("#highscoreTable tbody");
  tableBody.innerHTML = "";

  if (error) {
    console.error("Fehler beim Laden:", error.message);
    tableBody.innerHTML =
      '<tr><td colspan="3">Highscores konnten nicht geladen werden.</td></tr>';
    return;
  }

  data.forEach((entry, index) => {
    tableBody.innerHTML += `<tr><td>${index + 1}</td><td>${entry.name}</td><td>${entry.points}</td></tr>`;
  });
}

function endGame() {
  gameState = "gameover";
  gameOverTime = Date.now();
  lastScore = score;

  bgMusic.pause();
  bgMusic.currentTime = 0;

  fallSound.currentTime = 0;
  fallSound.play().catch(() => {});

  overlayTitle.textContent = "Abgestürzt!";
  overlayText.textContent = `Punkte: ${lastScore}`;
  overlayBtn.textContent = "Neustart";
  saveScoreBtn.classList.remove("d-none");
  overlay.classList.remove("d-none");
}

function update(dt) {
  // Physik
  birdVelocity += GRAVITY * dt;
  birdY += birdVelocity * dt;
  rotation = clamp(birdVelocity * 4, -25, 75);

  if (birdY - BIRD_RADIUS < 0) {
    birdY = BIRD_RADIUS;
    birdVelocity = 0;
  }
  if (birdY + BIRD_RADIUS > H) {
    birdY = H - BIRD_RADIUS;
    endGame();
    return;
  }

  // Hindernisse bewegen
  for (const ob of obstacles) {
    ob.x -= speed * dt;

    if (!ob.passed && ob.x + PIPE_WIDTH < BIRD_X) {
      ob.passed = true;
      score += 1;
      scoreEl.textContent = String(score);
      speed = BASE_SPEED + Math.min(score * 0.05, MAX_SPEED_BONUS);
    }

    // Kollision
    const hitTop = circleRectCollide(BIRD_X, birdY, BIRD_RADIUS, ob.x, 0, PIPE_WIDTH, ob.gapY);
    const hitBottom = circleRectCollide(
      BIRD_X,
      birdY,
      BIRD_RADIUS,
      ob.x,
      ob.gapY + ob.gapHeight,
      PIPE_WIDTH,
      H - (ob.gapY + ob.gapHeight)
    );
    if (hitTop || hitBottom) {
      endGame();
      return;
    }
  }

  // Alte Hindernisse entfernen, neue spawnen
  obstacles = obstacles.filter((ob) => ob.x + PIPE_WIDTH > -10);
  const last = obstacles[obstacles.length - 1];
  if (!last || W - last.x >= SPAWN_DISTANCE) {
    spawnObstacle(W + 20);
  }

  wingPhase += dt * 0.3;
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#11111f");
  gradient.addColorStop(1, "#241a22");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffffff";
  for (const s of stars) {
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(wingPhase + s.x);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ferne Bergsilhouette
  ctx.fillStyle = "#2a2030";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.62);
  ctx.lineTo(W * 0.2, H * 0.5);
  ctx.lineTo(W * 0.38, H * 0.6);
  ctx.lineTo(W * 0.58, H * 0.46);
  ctx.lineTo(W * 0.8, H * 0.58);
  ctx.lineTo(W, H * 0.5);
  ctx.lineTo(W, H * 0.65);
  ctx.lineTo(0, H * 0.65);
  ctx.closePath();
  ctx.fill();
}

function drawObstacle(ob) {
  const rockGradient = ctx.createLinearGradient(ob.x, 0, ob.x + PIPE_WIDTH, 0);
  rockGradient.addColorStop(0, "#5a4636");
  rockGradient.addColorStop(1, "#3a2c22");
  ctx.fillStyle = rockGradient;

  // Oberer Felsen
  ctx.fillRect(ob.x, 0, PIPE_WIDTH, ob.gapY);
  // Unterer Felsen
  ctx.fillRect(ob.x, ob.gapY + ob.gapHeight, PIPE_WIDTH, H - (ob.gapY + ob.gapHeight));

  // Kanten-Highlight für etwas Tiefe
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(ob.x, 0, 6, ob.gapY);
  ctx.fillRect(ob.x, ob.gapY + ob.gapHeight, 6, H - (ob.gapY + ob.gapHeight));

  // Schroffe Kante zur Lücke hin
  ctx.fillStyle = "#241a14";
  ctx.beginPath();
  ctx.moveTo(ob.x, ob.gapY);
  ctx.lineTo(ob.x + PIPE_WIDTH / 2, ob.gapY - 10);
  ctx.lineTo(ob.x + PIPE_WIDTH, ob.gapY);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(ob.x, ob.gapY + ob.gapHeight);
  ctx.lineTo(ob.x + PIPE_WIDTH / 2, ob.gapY + ob.gapHeight + 10);
  ctx.lineTo(ob.x + PIPE_WIDTH, ob.gapY + ob.gapHeight);
  ctx.closePath();
  ctx.fill();
}

function drawBird() {
  ctx.save();
  ctx.translate(BIRD_X, birdY);
  ctx.rotate((rotation * Math.PI) / 180);

  const flapOffset = gameState === "playing" ? Math.sin(wingPhase * 6) * 5 : Math.sin(wingPhase * 3) * 3;

  // Flügel (hinter der Figur, abgeleitet vom Logo)
  ctx.fillStyle = "#f5f1e8";
  ctx.beginPath();
  ctx.ellipse(-9, -3 + flapOffset, 9, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-9, 5 - flapOffset, 9, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Körper / Ranger-Shirt
  ctx.fillStyle = "#6b8e4e";
  ctx.beginPath();
  ctx.ellipse(0, 5, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Halstuch
  ctx.fillStyle = "#ff2e2e";
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.lineTo(4, -1);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();

  // Kopf
  ctx.fillStyle = "#f4c89a";
  ctx.beginPath();
  ctx.arc(2, -7, 8, 0, Math.PI * 2);
  ctx.fill();

  // Hutkrempe
  ctx.fillStyle = "#b08d57";
  ctx.beginPath();
  ctx.ellipse(2, -12, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hutkuppel
  ctx.fillStyle = "#a07b45";
  ctx.beginPath();
  ctx.ellipse(2, -15, 6, 4.5, 0, Math.PI, 0);
  ctx.fill();

  // Hutband
  ctx.fillStyle = "#ff2e2e";
  ctx.fillRect(-3.5, -14, 11, 2);

  // Wange
  ctx.fillStyle = "rgba(255,154,154,0.6)";
  ctx.beginPath();
  ctx.arc(-2, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Auge
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(6, -7, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6.6, -7.6, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function draw() {
  drawBackground();
  for (const ob of obstacles) {
    drawObstacle(ob);
  }
  drawBird();
}

function loop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = clamp((timestamp - lastTimestamp) / 16.6667, 0, 2.5);
  lastTimestamp = timestamp;

  if (gameState === "playing") {
    update(dt);
  } else {
    wingPhase += dt * 0.15;
  }

  draw();
  requestAnimationFrame(loop);
}

// ---- Modal handler ----
const modal = document.getElementById("gameOverModal");

document.getElementById("canyonflight_modalCloseBtn").addEventListener("click", () => {
    modal.style.display = "none";
});

// ---- Eingaben: Tastatur, Maus, Touch ----
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    handleInput();
  }
});

canvas.addEventListener("mousedown", handleInput);

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    handleInput();
  },
  { passive: false }
);

overlayBtn.addEventListener("click", handleInput);

saveScoreBtn.addEventListener("click", () => {
  showGameOverModal(lastScore);
});

// ---- Start ----
spawnObstacle(W + 100);
draw();
requestAnimationFrame(loop);
loadHighscores();
setHighestScore();