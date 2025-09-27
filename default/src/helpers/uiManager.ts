import { SaveGame } from "../SaveGame.js";
import { Main } from "../objects/Main/Main.js"; // damit toggleSound Main kennt

export function initUI(mainScene: Main) {

    // --- Overlay ---
    const closeBtn = document.getElementById("closeOverlay");
    const overlay = document.getElementById("overlay");
    if (closeBtn && overlay) {
        // Prüfen ob User das Overlay schon bestätigt hat
        const overlaySeen = SaveGame.loadOverlay();
        overlay.style.display = overlaySeen === "true" ? "none" : "flex";

        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            SaveGame.saveOverlay("true"); // Speichern
        });
    }

    // --- Reset Button ---
    const reset = document.getElementById("reset");
    if (reset) {
        reset.addEventListener("click", () => {
            SaveGame.clearAll();
            window.location.reload();
        });
    }

    // --- Sound ---
    const soundBtn = document.getElementById("sound") as HTMLButtonElement;
    if (soundBtn) {
        // Initialstatus setzen
        const isSoundOn = SaveGame.loadSound() === "on";
        soundBtn.textContent = isSoundOn ? "🔊" : "🔇";

        soundBtn.addEventListener("click", () => {
            toggleSound(mainScene, soundBtn);
        });
    }

    // --- Input ---
    const tabKeyboard = document.getElementById('tab-keyboard');
    const tabController = document.getElementById('tab-controller');
    const keyboardControls = document.getElementById('keyboard-controls');
    const controllerControls = document.getElementById('controller-controls');
    if (tabKeyboard && keyboardControls && controllerControls && tabController) {

        const input = SaveGame.loadInput();
        // beim Laden den zuletzt gespeicherten Modus wiederherstellen
        if (input === "keyboard") {
            keyboardControls.classList.remove("d-none");
            controllerControls.classList.add("d-none");
            tabKeyboard.classList.add("active");
            tabController.classList.remove("active");
        } else if (input === "controller") {
            controllerControls.classList.remove("d-none");
            keyboardControls.classList.add("d-none");
            tabController.classList.add("active");
            tabKeyboard.classList.remove("active");
        }

        tabKeyboard.addEventListener('click', () => {
            keyboardControls.classList.remove('d-none');
            controllerControls.classList.add('d-none');
            tabKeyboard.classList.add('active');
            tabController.classList.remove('active');

            SaveGame.saveInput("keyboard");
        });

        tabController.addEventListener('click', () => {
            controllerControls.classList.remove('d-none');
            keyboardControls.classList.add('d-none');
            tabController.classList.add('active');
            tabKeyboard.classList.remove('active');

            SaveGame.saveInput("controller");
        });
    }
}

// --------------------------
// Sound Umschalten
// --------------------------
function toggleSound(mainScene: Main, soundBtn: HTMLButtonElement) {
    let sound = SaveGame.loadSound();

    if (mainScene.level?.backgroundSound instanceof HTMLAudioElement) {
        if (sound === "off") {
            soundBtn.textContent = "🔊";
            mainScene.level.backgroundSound.play().catch(err => console.warn(err));
            SaveGame.saveSound("on");
        } else {
            soundBtn.textContent = "🔇";
            mainScene.level.backgroundSound.pause();
            SaveGame.saveSound("off");
        }
    }
}
