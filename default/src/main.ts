import { Main } from "./objects/Main/Main.js";
import { Vector2 } from "./Vector2.js";
import { OutdoorLevel1 } from "./levels/OutdoorLevel1.js";
import { GameLoop } from "./GameLoop.js";
import { gridCells } from "./helpers/grid.js";
import { SaveGame } from "./SaveGame.js";
import { levelRegistry } from "./helpers/levelRegistry.js";
import { initUI } from "./helpers/uiManager.js";

document.addEventListener("DOMContentLoaded", () => {
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
        });
      } else {
        // Fallback: Startlevel Outdoor with initial value
        SaveGame.initAll();

        startLevel = new OutdoorLevel1({
          position: new Vector2(0, 0),
        });
      }
      mainScene.setLevel(startLevel);

      /** init UI 
       * 🎮 Zurück zur Startseite
       * 🚧 Reset Game
       * 🔊 Sound an/aus
       * */
      initUI(mainScene);

      // Start the game
      const gameLoop = new GameLoop(update, draw);
      gameLoop.start();

      console.log(`START GAME`);
    }
  }
});

