import { Main } from "./src/objects/Main/Main.js";
import { Vector2 } from "./src/Vector2.js";
import { OutdoorLevel1 } from "./src/levels/OutdoorLevel1.js";
import { CaveLevel1 } from "./src/levels/CaveLevel1.js";
import { GameLoop } from "./src/GameLoop.js";
import { events } from "./src/Events.js";

// Canvas und Context holen
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Load the main scene
const mainScene = new Main({
  position: new Vector2(0, 0),
});

mainScene.setLevel(new OutdoorLevel1());

// Hero exits the map
// events.on(events.HERO_EXITS, mainScene, () => {
//   console.log("CHANGE THE MAP");
//   mainScene.setLevel(new CaveLevel1());
// });

// Update and Draw functions for the game loop
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene);
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
  mainScene.draw(ctx, 0, 0);

  // Restore the context to its original state
  ctx.restore();

  // Draw anything above the game world
  mainScene.drawForeground(ctx);
};

// Start the game
const gameLopp = new GameLoop(update, draw);
gameLopp.start();
