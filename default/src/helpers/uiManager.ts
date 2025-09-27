import { SaveGame } from "../SaveGame.js";
import { Main } from "../objects/Main/Main.js"; // damit toggleSound Main kennt

export function initUI(mainScene: Main) {
    const closeBtn = document.getElementById("closeOverlay");
    const overlay = document.getElementById("overlay");
    const reset = document.getElementById("reset");
    const soundBtn = document.getElementById("sound") as HTMLButtonElement;

    // --- Overlay ---
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
    if (reset) {
        reset.addEventListener("click", () => {
            SaveGame.clearAll();
            window.location.reload();
        });
    }

    // --- Sound ---
    if (soundBtn) {
        // Initialstatus setzen
        const isSoundOn = SaveGame.loadSound() === "on";
        soundBtn.textContent = isSoundOn ? "🔊" : "🔇";

        soundBtn.addEventListener("click", () => {
            toggleSound(mainScene, soundBtn);
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
