import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { DOWN, LEFT, RIGHT, UP } from "../../Input.js";
import { isSpaceFree } from "../../helpers/grid.js";
import { walls } from "../../levels/level1.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import {
  STAND_DOWN,
  STAND_LEFT,
  STAND_RIGHT,
  STAND_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  WALK_UP,
  PICK_UP_DOWN,
} from "./heroAnimations.js";
import { moveTowards } from "../../helpers/moveTowards.js";
import { TILE_SIZE } from "../../helpers/grid.js";
import { events } from "../../Events.js";

export class Hero extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y),
    });

    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -18),
    });
    this.addChild(shadow);

    this.body = new Sprite({
      resource: resources.images.hero,
      frameSize: new Vector2(32, 32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      position: new Vector2(-8, -19),
      animations: new Animations({
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standRight: new FrameIndexPattern(STAND_RIGHT),
        pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
      }),
    });
    this.addChild(this.body);

    this.facingDirection = DOWN;
    this.destinationPosition = this.position.duplicate();

    this.itemPickUpTime = 0;
    this.itemPickUpShell = null;

    events.on(events.HERO_PICKS_UP_ITEM, this, (data) => {
      this.onPickUpItem(data);
    });
  }

  step(delta, root) {
    // Implement Hero specific logic here

    // Lock movement if celebrating an item pickup
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }

    const distance = moveTowards(this, this.destinationPosition, 1);

    // Attempt to move if we have arrived
    const hasArrived = distance <= 0;
    if (hasArrived) {
      this.tryMove(root);
    }

    this.tryEmitPosition();
  }

  tryEmitPosition() {
    if (this.lastX === this.position.x && this.lastY === this.position.y) {
      return;
    }
    this.lastX = this.position.x;
    this.lastY = this.position.y;

    events.emit(events.HERO_POSTION, this.position);
  }

  tryMove(root) {
    const { input } = root;

    // No input
    if (!input.direction) {
      switch (this.facingDirection) {
        case LEFT:
          this.body.animations.play("standLeft");
          break;
        case RIGHT:
          this.body.animations.play("standRight");
          break;
        case UP:
          this.body.animations.play("standUp");
          break;
        case DOWN:
          this.body.animations.play("standDown");
          break;
      }

      return;
    }

    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;
    const grideSize = TILE_SIZE;

    switch (input.direction) {
      case LEFT:
        nextX -= grideSize;
        this.body.animations.play("walkLeft");
        break;
      case RIGHT:
        nextX += grideSize;
        this.body.animations.play("walkRight");
        break;
      case UP:
        nextY -= grideSize;
        this.body.animations.play("walkUp");
        break;
      case DOWN:
        nextY += grideSize;
        this.body.animations.play("walkDown");
        break;
    }

    this.facingDirection = input.direction ?? this.facingDirection;

    // Collision Detection
    if (isSpaceFree(walls, nextX, nextY)) {
      // update postion of hero
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;
    }
  }

  onPickUpItem({ image, position }) {
    // Make sure we land right on the item
    this.destinationPosition = position.duplicate();

    // Start the pickup animation
    this.itemPickUpTime = 1000; // ms

    this.itemPickUpShell = new GameObject({});
    this.itemPickUpShell.addChild(
      new Sprite({
        resource: image,
        position: new Vector2(0, -18),
      })
    );
    this.addChild(this.itemPickUpShell);
  }

  workOnItemPickUp(delta) {
    this.itemPickUpTime -= delta;
    this.body.animations.play("pickUpDown");

    // destroy gameobject wenn time to pick up is over
    if (this.itemPickUpTime <= 0) {
      this.itemPickUpShell.destroy();
    }
  }
}
