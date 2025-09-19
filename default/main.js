import { resources } from "./src/Resource.js";
import { Sprite } from "./src/Sprite.js";
import { Vector2 } from "./src/Vector2.js";
import { GameLoop } from "./src/GameLoop.js";
import { Input } from "./src/Input.js";
import { gridCells } from "./src/helpers/grid.js";
import { GameObject } from "./src/GameObject.js";
import { Hero } from "./src/objects/Hero/Hero.js";
import { Camera } from "./src/Camera.js";
// import {Rod} from "./src/objects/Rod/Rod.js";
// import {Inventory} from "./src/objects/Inventory/Inventory.js";

// Canvas und Context holen
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Load the main scene
const mainScene = new GameObject({
  position: new Vector2(0, 0),
});

// Build up the scene by adding a sky, ground and hero
const skySprite = new Sprite({
  resource: resources.images.sky,
  frameSize: new Vector2(320, 180),
});

const groundSprite = new Sprite({
  resource: resources.images.ground,
  frameSize: new Vector2(320, 180),
});
mainScene.addChild(groundSprite);

// Create Hero and add to scene
const hero = new Hero(gridCells(6), gridCells(5));
mainScene.addChild(hero);

const camera = new Camera();
mainScene.addChild(camera);

// Input handler
mainScene.input = new Input();

// Update and Draw functions for the game loop
const update = (delta) => {
  mainScene.stepEntry(delta, mainScene);
};

// Draw the main scene
const draw = () => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  skySprite.drawImage(ctx, 0, 0);

  // Save the current context state
  ctx.save();

  // Offset the entire scene to center the hero
  ctx.translate(camera.position.x, camera.position.y);

  // Draw objects in the mounted scene
  mainScene.draw(ctx, 0, 0);

  // Restore the context to its original state
  ctx.restore();
};

// Start the game
const gameLopp = new GameLoop(update, draw);
gameLopp.start();
