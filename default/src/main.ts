import { Main } from "./objects/Main/Main.js";
import { Vector2 } from "./Vector2.js";
import { OutdoorLevel1 } from "./levels/OutdoorLevel1.js";
import { GameLoop } from "./GameLoop.js";
import { } from "./types";
import { gridCells } from "./helpers/grid.js";

// Alpha Version 0.1 Hinweis
const closeBtn = document.getElementById("closeOverlay");
const overlay = document.getElementById("overlay");

if (closeBtn && overlay) {
  closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
  });
}

// Canvas und Context holen
const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Load the main scene
    const mainScene = new Main(new Vector2(0, 0));

    console.log(`ctx LOADED`, ctx);

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

    // Load start level 
    mainScene.setLevel(new OutdoorLevel1(
      {
        position: new Vector2(0, 0),
        heroPosition: new Vector2(gridCells(8), gridCells(4))
        // heroPosition: new Vector2(gridCells(1), gridCells(1))
      }));

    // Start the game
    const gameLoop = new GameLoop(update, draw);
    gameLoop.start();

    console.log(`START GAME`);
  }
} else {
  console.log("CANVAS NICHT GELADEN");
}


