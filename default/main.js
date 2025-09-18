// A simple resource loader for images
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  duplicate() {
    return new Vector2(this.x, this.y);
  }
}

class Resources {
  constructor() {
    // Everything we want to load
    this.toLoad = {
      ground: "./images/sprites/ground.png",
      hero: "./images/sprites/hero-sheet.png",
      rod: "./images/sprites/rod.png",
      shadow: "./images/sprites/shadow.png",
      sky: "./images/sprites/sky.png",
      spritesheet: "./images/sprites/spritesheet.png",
    };

    // A bucket to store all of our images
    this.images = {};

    // Load all of the images
    Object.keys(this.toLoad).forEach((key) => {
      const img = new Image();
      img.src = this.toLoad[key];

      this.images[key] = {
        image: img,
        isLoaded: false,
      };

      img.onload = () => {
        this.images[key].isLoaded = true;
        console.log(`${key} loaded!`);
      };
    });
  }
}

class Sprite {
  constructor({
    resource, // image we want to use
    frameSize, // size of each frame
    hFrames, // how is the sprite arranged horizontally
    vFrames, // how is the sprite arranged vertically
    frame, // which frame to show
    scale, // how large to draw the sprite
    position, // where to draw the sprite
  }) {
    this.resource = resource;
    this.frameSize = frameSize ?? new Vector2(16, 16);
    this.hFrames = hFrames ?? 1;
    this.vFrames = vFrames ?? 1;
    this.frame = frame ?? 0;
    this.frameMap = new Map();
    this.scale = scale ?? 1;
    this.position = position ?? new Vector2(0, 0);

    this.buildFrameMap();
  }

  buildFrameMap() {
    let frameCount = 0;
    for (let v = 0; v < this.vFrames; v++) {
      for (let h = 0; h < this.hFrames; h++) {
        this.frameMap.set(
          frameCount,
          new Vector2(this.frameSize.x * h, this.frameSize.y * v)
        );
        frameCount++;
      }
    }
  }

  drawImage(ctx, x, y) {
    if (!this.resource.isLoaded) {
      return;
    }

    // Find the correct Sprite
    let frameCoordX = 0;
    let frameCoordY = 0;
    const frame = this.frameMap.get(this.frame);
    if (frame) {
      frameCoordX = frame.x;
      frameCoordY = frame.y;
    }

    ctx.drawImage(
      this.resource.image, // Image
      frameCoordX, // X-Coordinate of the frame
      frameCoordY, // Y-Coordinate of the frame
      this.frameSize.x, // Width of the frame
      this.frameSize.y, // Height of the frame
      x, // X-Coordinate on the canvas
      y, // Y-Coordinate on the canvas
      this.frameSize.x * this.scale, // Width on the canvas
      this.frameSize.y * this.scale // Height on the canvas
    );
  }
}

class GameLoop {
  constructor(update, render) {
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.timeStep = 1000 / 60; // 60 FPS

    this.update = update;
    this.render = render;

    this.rafId = null;
    this.isRunning = false;
  }

  mainLoop = (timestamp) => {
    if (!this.isRunning) return;

    let deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulatedTime -= this.timeStep;
    }

    this.render();
    this.rafId = requestAnimationFrame(this.mainLoop);
  };

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.mainLoop);
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.isRunning = false;
  }
}

class Input {
  constructor() {
    this.heldDirections = [];

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.onArrowPressed(LEFT);
          break;
        case "ArrowRight":
          this.onArrowPressed(RIGHT);
          break;
        case "ArrowUp":
          this.onArrowPressed(UP);
          break;
        case "ArrowDown":
          this.onArrowPressed(DOWN);
          break;
        case "KeyA":
          this.onArrowPressed(LEFT);
          break;
        case "KeyD":
          this.onArrowPressed(RIGHT);
          break;
        case "KeyW":
          this.onArrowPressed(UP);
          break;
        case "KeyS":
          this.onArrowPressed(DOWN);
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.onArrowReleased(LEFT);
          break;
        case "ArrowRight":
          this.onArrowReleased(RIGHT);
          break;
        case "ArrowUp":
          this.onArrowReleased(UP);
          break;
        case "ArrowDown":
          this.onArrowReleased(DOWN);
          break;
        case "KeyA":
          this.onArrowReleased(LEFT);
          break;
        case "KeyD":
          this.onArrowReleased(RIGHT);
          break;
        case "KeyW":
          this.onArrowReleased(UP);
          break;
        case "KeyS":
          this.onArrowReleased(DOWN);
          break;
      }
    });
  }

  get direction() {
    return this.heldDirections[0];
  }

  onArrowPressed(direction) {
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  onArrowReleased(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index === -1) {
      return;
    }

    // Remove the direction from the array
    this.heldDirections.splice(index, 1);
  }
}

// ##### Const and Helpers #####

const LEFT = "LEFT";
const RIGHT = "RIGHT";
const UP = "UP";
const DOWN = "DOWN";
const TILE_SIZE = 16;

const wallDefinitions = {
  right: ["240,32", "256,48", "256,64", "256,80", "256,96"],
  left: ["32,48", "32,64", "32,80", "32,96"],
  top: [
    "48,32",
    "64,32",
    "80,32",
    "96,32",
    "112,16",
    "128,16",
    "144,16",
    "160,16",
    "176,16",
    "192,16",
    "208,16",
    "224,16",
  ],
  bottom: [
    "48,112",
    "64,112",
    "80,112",
    "96,112",
    "112,112",
    "128,112",
    "144,112",
    "160,112",
    "176,112",
    "192,112",
    "208,112",
    "224,112",
    "240,112",
  ],
  tree: ["64,48", "208,64", "224,32"],
  stone: ["192,96", "208,96", "224,96"],
  squares: ["64,64", "64,80", "80,64", "80,80", "128,48", "144,48"],
  water: ["112,80", "128,80", "144,80", "160,80"],
  house: ["224,64"],
};

const gridCells = (n) => {
  return n * TILE_SIZE;
};

const isSpaceFree = (walls, x, y) => {
  // convert to string
  const str = `${x},${y}`;

  // check if wall is present
  const isWallPresent = walls.has(str);

  return !isWallPresent;
};

function moveTowards(person, destinationPosition, speed) {
  let distanceToTravelX = destinationPosition.x - person.position.x;
  let distanceToTravelY = destinationPosition.y - person.position.y;

  let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

  if (distance <= speed) {
    // If we are close enough, just set the position to the destination
    person.position.x = destinationPosition.x;
    person.position.y = destinationPosition.y;
  } else {
    // Normalize the distance to travel
    let normalizedX = distanceToTravelX / distance;
    let normalizedY = distanceToTravelY / distance;

    // Move the person
    person.position.x += normalizedX * speed;
    person.position.y += normalizedY * speed;

    // Recaculate the distance to travel
    distanceToTravelX = destinationPosition.x - person.position.x;
    distanceToTravelY = destinationPosition.y - person.position.y;
    distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);
  }

  return distance;
}

// ##### Main Game Code #####

// Load all Images
const resources = new Resources();

// Canvas und Context holen
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

// Sprites erstellen
const skySprite = new Sprite({
  resource: resources.images.sky,
  frameSize: new Vector2(320, 180),
});

const groundSprite = new Sprite({
  resource: resources.images.ground,
  frameSize: new Vector2(320, 180),
});

const heroSprite = new Sprite({
  resource: resources.images.hero,
  frameSize: new Vector2(32, 32),
  hFrames: 3,
  vFrames: 8,
  frame: 1,
  position: new Vector2(gridCells(6), gridCells(5)),
});

const heroDestinationPosition = heroSprite.position.duplicate();

const shadowSprite = new Sprite({
  resource: resources.images.shadow,
  frameSize: new Vector2(32, 32),
});

// Collision Preperation
const walls = new Set(Object.values(wallDefinitions).flat());

// Input handler
const input = new Input();

const update = () => {
  const distance = moveTowards(heroSprite, heroDestinationPosition, 1);

  // Attempt to move if we have arrived
  const hasArrived = distance <= 0;
  if (hasArrived) {
    tryMove();
  }
};

const tryMove = () => {
  if (!input.direction) {
    return;
  }

  let nextX = heroDestinationPosition.x;
  let nextY = heroDestinationPosition.y;
  const grideSize = 16;

  switch (input.direction) {
    case LEFT:
      nextX -= grideSize;
      heroSprite.frame = 9;
      break;
    case RIGHT:
      nextX += grideSize;
      heroSprite.frame = 3;
      break;
    case UP:
      nextY -= grideSize;
      heroSprite.frame = 6;
      break;
    case DOWN:
      nextY += grideSize;
      heroSprite.frame = 0;
      break;
  }

  // Collision Detection
  if (isSpaceFree(walls, nextX, nextY)) {
    // update postion of hero
    heroDestinationPosition.x = nextX;
    heroDestinationPosition.y = nextY;
  }
};

const draw = () => {
  skySprite.drawImage(ctx, 0, 0);
  groundSprite.drawImage(ctx, 0, 0);

  // Center the hero
  const heroOffset = new Vector2(-8, -21);
  const heroPosX = heroSprite.position.x + heroOffset.x;
  const heroPosY = heroSprite.position.y + 1 + heroOffset.y;

  shadowSprite.drawImage(ctx, heroPosX, heroPosY);
  heroSprite.drawImage(ctx, heroPosX, heroPosY);
};

const gameLopp = new GameLoop(update, draw);
gameLopp.start();

// ##### Ende Main Game Code #####
