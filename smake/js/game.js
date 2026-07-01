"use strict";

/* =========================================================
   Supabase – Highscore-Backend
   Erwartetes Tabellenschema "highscores":
     id           uuid       primary key, default gen_random_uuid()
     player_name  text
     score        int
     created_at   timestamp  default now()
   ========================================================= */
const SUPABASE_URL = "https://gcjwjjfajvmraxjokhoh.supabase.co";
const SUPABASE_KEY = "sb_publishable_-VOW-uAt6oJOmTBb_6z4Fg_ThcQxkl0";

let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === "function") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn(
      "Supabase-Script nicht geladen – Highscore-Funktionen sind deaktiviert, das Spiel bleibt aber spielbar.",
    );
  }
} catch (err) {
  console.error("Supabase-Client konnte nicht initialisiert werden:", err);
}

/* =========================================================
   RangeR Games – Smake
   Klassisches Gitter-Smake mit Retro-CRT-Optik.
   Steuerung: Pfeiltasten / WASD (Desktop), D-Pad / Wischen (Mobile).
   Highscores werden in Supabase gespeichert (Tabelle "highscores").
   ========================================================= */

(() => {
  const CONFIG = {
    gridSize: 20, // Felder pro Seite
    startInterval: 250, // ms pro Zug, am Anfang
    minInterval: 100, // ms pro Zug, schnellste Stufe
    speedStep: 2, // ms schneller pro gefressenem Apfel
    scorePerFood: 10,
    swipeThreshold: 24, // px, ab der ein Touch als Wisch statt Tipp gilt
  };

  const DIR = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const KEY_MAP = {
    ArrowUp: DIR.up,
    KeyW: DIR.up,
    ArrowDown: DIR.down,
    KeyS: DIR.down,
    ArrowLeft: DIR.left,
    KeyA: DIR.left,
    ArrowRight: DIR.right,
    KeyD: DIR.right,
  };

  /** @type {{status:string, smake:{x:number,y:number}[], dir:{x:number,y:number}, pendingDir:{x:number,y:number}|null, food:{x:number,y:number}, score:number, highscore:number, tickInterval:number, cell:number, scoreSaved:boolean}} */
  const state = {
    status: "ready", // ready | running | paused | over
    smake: [],
    dir: { ...DIR.right },
    pendingDir: null,
    food: { x: 0, y: 0 },
    score: 0,
    highscore: 0,
    tickInterval: CONFIG.startInterval,
    cell: 0,
    scoreSaved: false,
  };

  let dom = {};
  let ctx;
  let colors;
  let rafId = null;
  let lastTime = 0;
  let accumulator = 0;
  let touchStart = null;
  let modalBackdropEl = null;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    dom = {
      canvas: document.getElementById("gameCanvas"),
      crtFrame: document.getElementById("crtFrame"),
      score: document.getElementById("score"),
      highscore: document.getElementById("highscore"),
      overlay: document.getElementById("overlay"),
      overlayEyebrow: document.getElementById("overlayEyebrow"),
      overlayTitle: document.getElementById("overlayTitle"),
      overlayText: document.getElementById("overlayText"),
      overlayButton: document.getElementById("overlayButton"),
      saveScoreButton: document.getElementById("saveScoreButton"),
      dpad: document.getElementById("dpad"),
      pauseIcon: document.getElementById("pauseIcon"),
      saveScoreModalEl: document.getElementById("saveScoreModal_smake"),
      modalScoreValue: document.getElementById("modalScoreValue"),
      playerNameInput: document.getElementById("playerNameInput"),
      confirmSaveButton: document.getElementById("confirmSaveButton"),
      modalError: document.getElementById("modalError"),
    };

    ctx = dom.canvas.getContext("2d");
    colors = readColors();

    setupInput();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.status === "running") pauseGame();
    });

    resize();
    resetGame();
    window.addEventListener("load", resize);

    rafId = requestAnimationFrame(loop);

    // Bestwert + Tabelle aus der Datenbank laden (blockiert das Spiel nicht)
    refreshBestScore();
    loadHighscoreTable();
  }

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const read = (name, fallback) =>
      cs.getPropertyValue(name).trim() || fallback;
    return {
      bg: read("--canvas-bg", "#070907"),
      grid: read("--grid-line", "rgba(57,255,106,0.07)"),
      phosphor: read("--phosphor", "#39ff6a"),
      phosphorDim: read("--phosphor-dim", "#1f8f3f"),
      amber: read("--amber", "#ffb000"),
    };
  }

  /* ---------- Größe / Skalierung ---------- */

  function resize() {
    const size = Math.floor(dom.crtFrame.clientWidth);
    if (size <= 0) return;
    const cell = Math.max(4, Math.floor(size / CONFIG.gridSize));
    const canvasSize = cell * CONFIG.gridSize;
    const dpr = window.devicePixelRatio || 1;

    dom.canvas.width = canvasSize * dpr;
    dom.canvas.height = canvasSize * dpr;
    dom.canvas.style.width = canvasSize + "px";
    dom.canvas.style.height = canvasSize + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.cell = cell;
    render();
  }

  /* ---------- Spielzustand ---------- */

  function resetGame() {
    const mid = Math.floor(CONFIG.gridSize / 2);
    state.smake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    state.dir = { ...DIR.right };
    state.pendingDir = null;
    state.score = 0;
    state.scoreSaved = false;
    state.tickInterval = CONFIG.startInterval;
    spawnFood();
    updateScoreboard();
    state.status = "ready";
    updatePauseIcon();
    toggleSaveButton(false);
    showOverlay(
      "BEREIT?",
      "SMAKE",
      "Leertaste, Tippen ins Feld oder D-Pad zum Start",
      "START",
    );
    render();
  }

  function startGame() {
    hideOverlay();
    state.status = "running";
    lastTime = performance.now();
    accumulator = 0;
    updatePauseIcon();
  }

  function pauseGame() {
    if (state.status !== "running") return;
    state.status = "paused";
    updatePauseIcon();
    showOverlay(
      "PAUSIERT",
      "PAUSE",
      "Weiter mit Leertaste oder der Pause-Taste",
      "WEITER",
    );
  }

  function resumeGame() {
    if (state.status !== "paused") return;
    hideOverlay();
    state.status = "running";
    lastTime = performance.now();
    accumulator = 0;
    updatePauseIcon();
  }

  function gameOver() {
    state.status = "over";
    const newRecord = state.score > state.highscore;
    updatePauseIcon();
    vibrate([30, 40, 30]);
    showOverlay(
      "GAME OVER",
      newRecord ? "NEUER BESTWERT!" : "VERSUCH'S NOCHMAL",
      `Punkte: ${state.score}`,
      "🔄 Neustart",
    );
    toggleSaveButton(state.score > 0);
  }

  function handlePrimaryAction() {
    if (state.status === "ready") startGame();
    else if (state.status === "paused") resumeGame();
    else if (state.status === "over") {
      resetGame();
      startGame();
    } else if (state.status === "running") pauseGame();
  }

  function handleDirectionInput(dir) {
    if (state.status === "ready") {
      state.pendingDir = dir;
      startGame();
      return;
    }
    if (state.status !== "running") return;
    state.pendingDir = dir;
  }

  /* ---------- Spiellogik ---------- */

  function spawnFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * CONFIG.gridSize),
        y: Math.floor(Math.random() * CONFIG.gridSize),
      };
    } while (state.smake.some((s) => s.x === pos.x && s.y === pos.y));
    state.food = pos;
  }

  function applyPendingDirection() {
    if (!state.pendingDir) return;
    const opposite =
      state.dir.x === -state.pendingDir.x &&
      state.dir.y === -state.pendingDir.y;
    if (!opposite) state.dir = state.pendingDir;
    state.pendingDir = null;
  }

  function tick() {
    applyPendingDirection();

    const head = state.smake[0];
    const next = {
      x: (head.x + state.dir.x + CONFIG.gridSize) % CONFIG.gridSize,
      y: (head.y + state.dir.y + CONFIG.gridSize) % CONFIG.gridSize,
    };

    const willEat = next.x === state.food.x && next.y === state.food.y;
    const bodyToCheck = willEat ? state.smake : state.smake.slice(0, -1);
    if (bodyToCheck.some((s) => s.x === next.x && s.y === next.y)) {
      gameOver();
      return;
    }

    state.smake.unshift(next);

    if (willEat) {
      state.score += CONFIG.scorePerFood;
      state.tickInterval = Math.max(
        CONFIG.minInterval,
        state.tickInterval - CONFIG.speedStep,
      );
      spawnFood();
      vibrate(20);
      updateScoreboard();
    } else {
      state.smake.pop();
    }

    render();
  }

  function loop(timestamp) {
    rafId = requestAnimationFrame(loop);

    if (state.status !== "running") {
      lastTime = timestamp;
      return;
    }

    let dt = timestamp - lastTime;
    lastTime = timestamp;
    if (dt > 1000) dt = state.tickInterval; // Tab war im Hintergrund: keinen Sprung verursachen

    accumulator += dt;
    while (accumulator >= state.tickInterval) {
      accumulator -= state.tickInterval;
      tick();
      if (state.status !== "running") break;
    }
  }

  /* ---------- Darstellung ---------- */

  function render() {
    if (!state.cell) return;
    const size = state.cell * CONFIG.gridSize;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < CONFIG.gridSize; i++) {
      const p = i * state.cell + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    drawFood();
    state.smake.forEach((seg, i) => drawSegment(seg, i === 0));
  }

  function drawFood() {
    const c = state.cell;
    const x = state.food.x * c + c / 2;
    const y = state.food.y * c + c / 2;

    ctx.save();
    ctx.shadowColor = colors.amber;
    ctx.shadowBlur = c * 0.6;
    ctx.fillStyle = colors.amber;
    ctx.beginPath();
    ctx.arc(x, y, c * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSegment(seg, isHead) {
    const c = state.cell;
    const pad = isHead ? c * 0.06 : c * 0.12;
    const x = seg.x * c + pad;
    const y = seg.y * c + pad;
    const s = c - pad * 2;

    ctx.save();
    ctx.shadowColor = colors.phosphor;
    ctx.shadowBlur = isHead ? c * 0.5 : c * 0.25;
    ctx.fillStyle = isHead ? colors.phosphor : colors.phosphorDim;
    roundedRectPath(ctx, x, y, s, s, c * 0.22);
    ctx.fill();
    ctx.restore();

    if (isHead) drawEyes(seg, c);
  }

  function drawEyes(seg, c) {
    const { dir } = state;
    const cx = seg.x * c + c / 2;
    const cy = seg.y * c + c / 2;
    const offset = c * 0.18;
    const eyeSize = Math.max(1.5, c * 0.08);
    let e1, e2;

    if (dir.x === 1) {
      e1 = { x: cx + offset * 0.6, y: cy - offset };
      e2 = { x: cx + offset * 0.6, y: cy + offset };
    } else if (dir.x === -1) {
      e1 = { x: cx - offset * 0.6, y: cy - offset };
      e2 = { x: cx - offset * 0.6, y: cy + offset };
    } else if (dir.y === 1) {
      e1 = { x: cx - offset, y: cy + offset * 0.6 };
      e2 = { x: cx + offset, y: cy + offset * 0.6 };
    } else {
      e1 = { x: cx - offset, y: cy - offset * 0.6 };
      e2 = { x: cx + offset, y: cy - offset * 0.6 };
    }

    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = colors.bg;
    [e1, e2].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function roundedRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  /* ---------- UI: Overlay / Anzeige ---------- */

  function showOverlay(eyebrow, title, text, buttonLabel) {
    dom.overlayEyebrow.textContent = eyebrow;
    dom.overlayTitle.textContent = title;
    dom.overlayText.textContent = text;
    dom.overlayButton.textContent = buttonLabel;
    dom.overlay.classList.remove("is-hidden");
  }

  function hideOverlay() {
    dom.overlay.classList.add("is-hidden");
  }

  function toggleSaveButton(show) {
    if (!dom.saveScoreButton) return;
    dom.saveScoreButton.classList.toggle("is-hidden", !show);
  }

  function updateScoreboard() {
    dom.score.textContent = String(state.score).padStart(3, "0");
    dom.highscore.textContent = String(state.highscore).padStart(3, "0");
  }

  function updatePauseIcon() {
    if (!dom.pauseIcon) return;
    dom.pauseIcon.className =
      state.status === "running" ? "fa-solid fa-pause" : "fa-solid fa-play";
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  /* ---------- Highscore (Supabase) ---------- */

  async function refreshBestScore() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from("highscores")
      .select("name, points")
      .eq("game", "smake")
      .order("points", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Fehler beim Laden des Bestwerts:", error.message);
      return;
    }

    state.highscore = data && data.length > 0 ? data[0].points : 0;
    updateScoreboard();
  }

  async function loadHighscoreTable() {
    const tableBody = document.querySelector("#highscoreTable tbody");
    if (!tableBody) return;

    if (!supabaseClient) {
      tableBody.innerHTML =
        '<tr><td colspan="3">Highscores aktuell nicht verfügbar.</td></tr>';
      return;
    }

    const { data, error } = await supabaseClient
      .from("highscores")
      .select("name, points")
      .eq("game", "smake")
      .order("points", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Fehler beim Laden:", error.message);
      tableBody.innerHTML =
        '<tr><td colspan="3">Highscores konnten nicht geladen werden.</td></tr>';
      return;
    }

    if (!data || data.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="3">Noch keine Einträge. Sei der Erste!</td></tr>';
      return;
    }

    tableBody.innerHTML = data
      .map(
        (entry, index) =>
          `<tr><td>${index + 1}</td><td>${escapeHtml(entry.name)}</td><td>${entry.points}</td></tr>`,
      )
      .join("");
  }

  async function saveHighscore(name, points) {
    if (!supabaseClient) {
      console.error("Speichern nicht möglich: Supabase-Client fehlt.");
      return false;
    }

    const { error } = await supabaseClient
      .from("highscores")
      .insert({ name, points, game: "smake" });

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
      return false;
    }
    return true;
  }

  /* ---------- UI: Modal "Highscore speichern" ----------
     Bewusst ohne bootstrap.Modal umgesetzt: nutzt nur die CSS-Klassen
     von Bootstrap (.modal/.fade/.show/.modal-backdrop), die unabhängig
     vom JS-Bundle per <link> geladen werden. Funktioniert dadurch auch,
     wenn bootstrap.bundle.min.js mal nicht laden sollte. */

  function showSaveScoreModal() {
    const modalEl = dom.saveScoreModalEl;
    if (!modalEl) {
      console.error('Modal-Element "#saveScoreModal" wurde nicht gefunden.');
      return;
    }

    modalEl.style.display = "block";
    modalEl.removeAttribute("aria-hidden");
    modalEl.setAttribute("aria-modal", "true");
    document.body.classList.add("modal-open");

    modalBackdropEl = document.createElement("div");
    modalBackdropEl.className = "modal-backdrop fade";
    document.body.appendChild(modalBackdropEl);

    // Eine Frame warten, damit die fade-Transition (Opacity) greift
    requestAnimationFrame(() => {
      modalEl.classList.add("show");
      if (modalBackdropEl) modalBackdropEl.classList.add("show");
    });

    setTimeout(() => dom.playerNameInput.focus(), 200);
  }

  function hideSaveScoreModal() {
    const modalEl = dom.saveScoreModalEl;
    if (!modalEl) return;

    modalEl.classList.remove("show");
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.removeAttribute("aria-modal");
    document.body.classList.remove("modal-open");

    if (modalBackdropEl) {
      modalBackdropEl.classList.remove("show");
      const backdropToRemove = modalBackdropEl;
      setTimeout(() => backdropToRemove.remove(), 200);
      modalBackdropEl = null;
    }

    setTimeout(() => {
      modalEl.style.display = "none";
    }, 200);
  }

  function openSaveScoreModal() {
    if (state.status !== "over" || state.scoreSaved) return;

    dom.modalScoreValue.textContent = String(state.score);
    dom.modalError.classList.add("is-hidden");
    dom.playerNameInput.value = "";
    dom.playerNameInput.disabled = false;
    dom.confirmSaveButton.disabled = false;
    dom.confirmSaveButton.textContent = "Speichern";

    showSaveScoreModal();
  }

  async function handleConfirmSave() {
    const name = dom.playerNameInput.value.trim();

    if (!name) {
      dom.modalError.textContent = "Bitte gib einen Namen ein.";
      dom.modalError.classList.remove("is-hidden");
      dom.playerNameInput.focus();
      return;
    }

    dom.modalError.classList.add("is-hidden");
    dom.confirmSaveButton.disabled = true;
    dom.confirmSaveButton.textContent = "Speichert…";

    const ok = await saveHighscore(name, state.score);

    if (!ok) {
      dom.confirmSaveButton.disabled = false;
      dom.confirmSaveButton.textContent = "Speichern";
      dom.modalError.textContent =
        "Speichern fehlgeschlagen. Bitte erneut versuchen.";
      dom.modalError.classList.remove("is-hidden");
      return;
    }

    state.scoreSaved = true;
    toggleSaveButton(false);

    // Kurzes Erfolgsfeedback, bevor sich das Modal automatisch schließt
    dom.playerNameInput.disabled = true;
    dom.confirmSaveButton.textContent = "Gespeichert ✅";

    await Promise.all([refreshBestScore(), loadHighscoreTable()]);

    setTimeout(hideSaveScoreModal, 900);
  }

  /* ---------- Eingabe ---------- */

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_err) {
        /* Haptik nicht unterstützt – ignorieren */
      }
    }
  }

  function setupInput() {
    window.addEventListener("keydown", (e) => {
      // Escape schließt das Modal, unabhängig davon wo der Fokus liegt
      if (
        e.code === "Escape" &&
        dom.saveScoreModalEl &&
        dom.saveScoreModalEl.classList.contains("show")
      ) {
        e.preventDefault();
        hideSaveScoreModal();
        return;
      }

      // Während im Modal getippt wird, sollen Pfeiltasten/WASD nicht die Smake steuern
      const targetTag = (e.target && e.target.tagName) || "";
      if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;

      if (KEY_MAP[e.code]) {
        e.preventDefault();
        handleDirectionInput(KEY_MAP[e.code]);
        return;
      }
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handlePrimaryAction();
      }
    });

    dom.overlayButton.addEventListener("click", handlePrimaryAction);

    if (dom.saveScoreButton) {
      dom.saveScoreButton.addEventListener("pointerdown", (e) => {
        e.stopPropagation(); // verhindert Bubbling zum crtFrame → kein ungewollter Neustart
      });

      dom.saveScoreButton.addEventListener("click", openSaveScoreModal);
    }
    if (dom.confirmSaveButton) {
      dom.confirmSaveButton.addEventListener("click", handleConfirmSave);
    }
    if (dom.playerNameInput) {
      dom.playerNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleConfirmSave();
        }
      });
    }
    if (dom.saveScoreModalEl) {
      // "X" und "Abbrechen" (beide mit data-bs-dismiss="modal") schließen das Modal
      dom.saveScoreModalEl
        .querySelectorAll('[data-bs-dismiss="modal"]')
        .forEach((btn) => btn.addEventListener("click", hideSaveScoreModal));

      // Klick auf den abgedunkelten Bereich außerhalb des Dialogs schließt ebenfalls
      dom.saveScoreModalEl.addEventListener("click", (e) => {
        if (e.target === dom.saveScoreModalEl) hideSaveScoreModal();
      });
    }

    // Tippen/Klicken direkt ins Spielfeld
    dom.crtFrame.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return; // Touch wird separat über Wisch-/Tipp-Erkennung behandelt
      if (dom.overlay && dom.overlay.contains(e.target)) return; // Klick gilt dem Overlay-Button, nicht dem Frame
      handlePrimaryAction();
    });

    setupDpad();
    setupSwipe();
  }

  function setupDpad() {
    const buttons = dom.dpad.querySelectorAll(".dpad-btn");
    buttons.forEach((btn) => {
      const dirName = btn.dataset.dir;
      const action = btn.dataset.action;

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        btn.classList.add("is-pressed");
        vibrate(12);
        if (dirName) handleDirectionInput(DIR[dirName]);
        else if (action === "pause") handlePrimaryAction();
      });

      ["pointerup", "pointerleave", "pointercancel"].forEach((evt) =>
        btn.addEventListener(evt, () => btn.classList.remove("is-pressed")),
      );
    });
  }

  function setupSwipe() {
    dom.crtFrame.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        touchStart = { x: t.clientX, y: t.clientY };
      },
      { passive: true },
    );

    dom.crtFrame.addEventListener(
      "touchend",
      (e) => {
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const distance = Math.max(absDx, absDy);
        touchStart = null;

        // Tap auf einen Button im Overlay soll dessen eigenen click-Handler auslösen,
        // nicht handlePrimaryAction – sonst startet das Spiel neu statt das Modal zu öffnen
        if (dom.overlay && dom.overlay.contains(e.target)) return;

        if (distance < CONFIG.swipeThreshold) {
          handlePrimaryAction();
          return;
        }

        if (absDx > absDy) handleDirectionInput(dx > 0 ? DIR.right : DIR.left);
        else handleDirectionInput(dy > 0 ? DIR.down : DIR.up);
      },
      { passive: true },
    );
  }

  // Eingabe live filtern (nur einmal registrieren, nicht bei jedem Modal-Öffnen)
  document.getElementById("playerNameInput").addEventListener("input", (e) => {
    e.target.value = sanitizeName(e.target.value);
  });

  function sanitizeName(input) {
    return input
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);
  }
})();