import { moveTowards } from "../../helpers/moveTowards.js";
import { TILE_SIZE, isSpaceFree } from "../../helpers/grid.js";

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

import {
  events,
  HERO_POSTION,
  HERO_PICKS_UP_ITEM,
  HERO_REQUESTS_ACTION,
  TEXTBOX_START,
  TEXTBOX_END,
  HERO_ATTACK_ACTION,
} from "../../Events.js";

import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { DOWN, LEFT, RIGHT, UP } from "../../Input.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { Main } from "../Main/Main.js";
import { Direction } from "../../types.js";
import { SaveGame } from "../../SaveGame.js";
import { InventoryEvent } from "../Inventory/Inventory.js";

export class Hero extends GameObject {

  body: Sprite;
  facingDirection: Direction;
  destinationPosition: Vector2;
  itemPickUpTime: number;
  itemPickUpShell: null | GameObject;
  isLocked: boolean;
  lastX?: number;
  lastY?: number;

  constructor(x: number, y: number) {
    super(new Vector2(x, y));

    const shadow = new Sprite({
      resource: resources.images.shadow,
      position: new Vector2(-8, -18),
      frameSize: new Vector2(32, 32),
    });
    this.addChild(shadow);

    this.body = new Sprite({
      resource: resources.images.hero,
      position: new Vector2(-8, -19),
      frameSize: new Vector2(32, 32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
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
    this.isLocked = false;
  }

  ready() {
    // Hero picks up item
    events.on(HERO_PICKS_UP_ITEM, this, (data: InventoryEvent) => {
      this.onPickUpItem(data);
    });

    events.on(TEXTBOX_START, this, () => {
      // Spieler sofort fixieren
      this.isLocked = true;
    });

    events.on(TEXTBOX_END, this, () => {
      this.isLocked = false;
    });
  }

  step(delta: number, root: Main) {
    // Implement Hero specific logic here

    // locked movement while in conversation with npc, etc.
    if (this.isLocked) {

      // Held in Stand-Animation bringen
      if (this.body.animations) {
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
      }
      return;
    }

    // Lock movement if celebrating an item pickup
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }

    // Check for input
    const input = root.input;
    if (input.getActionJustPressed("Space")) {

      // Look for an object at the next space (according to where Hero is facing)
      if (this.parent) {
        const objAtPosition = this.parent.children.find((child) => {
          return child.position.matches(
            this.position.toNeighbor(this.facingDirection)
          );
        });


        if (objAtPosition && !(objAtPosition instanceof Hero)) {
          // TODO: debug entfernen
          // console.log(this.facingDirection, objAtPosition);
          events.emit(HERO_REQUESTS_ACTION, objAtPosition);
        }
      }
    }

    if (input.getActionJustPressed("KeyF")) {

      // Look for an object at the next space (according to where Hero is facing)
      if (this.parent) {
        const objAtPosition = this.parent.children.find((child) => {
          return child.position.matches(
            this.position.toNeighbor(this.facingDirection)
          );
        });


        if (objAtPosition && !(objAtPosition instanceof Hero)) {
          // TODO: debug entfernen
          // console.log(this.facingDirection, objAtPosition);
          events.emit(HERO_ATTACK_ACTION, objAtPosition);
        }
      }
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

    if (this.body.position) {
      events.emit(HERO_POSTION, this.position);
    }
  }

  tryMove(root: Main) {
    // Input aus Main holen
    const input = root.input;

    // No input
    if (!input.direction && this.body.animations) {
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

    if (this.body.animations) {
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
    }

    this.facingDirection = input.direction ?? this.facingDirection;

    // Level aus Main holen
    const level = root.level;
    if (level) {
      const walls = level.walls;
      if (!walls || !this.parent) return;

      if (walls) {
        const spaceIsFree = isSpaceFree(walls, nextX, nextY);

        const solidBodyAtSpace = this.parent.children.find((c) => {
          return c.isSolid && c.position.x === nextX && c.position.y === nextY;
        });

        // Collision Detection
        if (spaceIsFree && !solidBodyAtSpace) {
          // update postion of hero
          this.destinationPosition.x = nextX;
          this.destinationPosition.y = nextY;

          //** Ziel Position im localStorage speichern */ 
          SaveGame.saveHero(
            level.levelId,
            this.destinationPosition
          );
        }
      }
    }
  }

  onPickUpItem(data: InventoryEvent) {
    // Make sure we land right on the item
    const position = data.position;
    if (position) {
      this.destinationPosition = position.duplicate();

      // Start the pickup animation
      this.itemPickUpTime = 1000; // ms

      // Play pick up sound from Item
      const isSoundOn = SaveGame.loadSound();
      if (isSoundOn === "on") {
        data.itemSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
      }

      const image = data.image;
      if (image) {
        // this.itemPickUpShell = new GameObject(position);
        this.itemPickUpShell = new GameObject(new Vector2(0, 0));
        this.itemPickUpShell.addChild(
          new Sprite({
            resource: image,
            position: new Vector2(0, -19), // show item image above head of hero
          })
        );
        this.addChild(this.itemPickUpShell);
      }
    }
  }

  workOnItemPickUp(delta: number) {
    this.itemPickUpTime -= delta;

    if (this.body.animations) {
      this.body.animations.play("pickUpDown");
    }

    // destroy gameobject wenn time to pick up is over
    if (this.itemPickUpShell && this.itemPickUpTime <= 0) {
      this.itemPickUpShell.destroy();
      this.itemPickUpShell = null;
    }
  }
}
