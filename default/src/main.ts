import { Main } from "./objects/Main/Main.js";
import { Vector2 } from "./Vector2.js";
import { OutdoorLevel1 } from "./levels/OutdoorLevel1.js";
import { GameLoop } from "./GameLoop.js";
import { gridCells } from "./helpers/grid.js";
import { SaveGame } from "./SaveGame.js";
import { levelRegistry } from "./helpers/levelRegistry.js";

document.addEventListener("DOMContentLoaded", () => {
  // Alpha Version 0.1 Hinweis
  const closeBtn = document.getElementById("closeOverlay");
  const overlay = document.getElementById("overlay");
  const reset = document.getElementById("reset");

  // Overlay einmal schließen
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.style.visibility = "hidden";
    });

    // Prüfen ob User das Overlay schon bestätigt hat
    const overlaySeen = SaveGame.loadOverlay();

    if (overlaySeen === "true") {
      overlay.style.display = "none"; // Overlay verstecken
    } else {
      overlay.style.display = "flex"; // Overlay anzeigen
    }

    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      SaveGame.saveOverlay("true")// Speichern
    });
  }

  if (reset) {
    reset.addEventListener("click", () => {
      // Alles löschen (Inventar + Hero-Position)
      SaveGame.clearAll();

      // Optional: Hard-Reload, damit der Startzustand geladen wird
      window.location.reload();
    });
  }

  // Canvas und Context holen
  const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      console.log(`ctx LOADED`, ctx);

      // Load the main scene
      const mainScene = new Main(new Vector2(0, 0));

      // Update and Draw functions for the game loop
      const update = (delta: number) => {
        mainScene.stepEntry(delta, mainScene);
        mainScene.input.update();
      };

      // Draw the main scene
      const draw = () => {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Background Image
        mainScene.drawBackground(ctx);

        // Save the current state (for camera offset)
        ctx.save();

        // Offset by camera position
        if (mainScene.camera) {
          ctx.translate(mainScene.camera.position.x, mainScene.camera.position.y);
        }

        // Draw objects in the mounted scene
        mainScene.drawObjects(ctx);

        // Restore the context to its original state
        ctx.restore();

        // Draw anything above the game world
        mainScene.drawForeground(ctx);
      };

      //** Dynamic level load if found in localStorage */
      const savedLevelId = SaveGame.loadLevel();
      let startLevel;
      if (savedLevelId && levelRegistry[savedLevelId]) {
        // Level aus Registry dynamisch laden
        const LevelClass = levelRegistry[savedLevelId];
        startLevel = new LevelClass({
          position: new Vector2(0, 0),
          // heroPosition wird automatisch aus SaveGame.loadHero gezogen
        });
      } else {
        // Fallback: Startlevel Outdoor
        startLevel = new OutdoorLevel1({
          position: new Vector2(0, 0),
          heroPosition: new Vector2(gridCells(8), gridCells(4))
        });
      }
      mainScene.setLevel(startLevel);

      // Start the game
      const gameLoop = new GameLoop(update, draw);
      gameLoop.start();

      console.log(`START GAME`);
    }
  }
});


