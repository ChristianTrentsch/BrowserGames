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
  DAMAGE_DOWN,
  DAMAGE_RIGHT,
  DAMAGE_UP,
  DAMAGE_LEFT,
  ATTACK_WALK_DOWN,
  ATTACK_WALK_RIGHT,
  ATTACK_WALK_UP,
  ATTACK_WALK_LEFT,
} from "./heroAnimations.js";

import {
  events,
  HERO_POSTION,
  HERO_PICKS_UP_ITEM,
  HERO_REQUESTS_ACTION,
  TEXTBOX_START,
  TEXTBOX_END,
  HERO_ATTACK_ACTION,
  HERO_CHANGE_EQUIPMENT,
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
import { INVENTORY_ITEMS, InventoryEvent } from "../Inventory/Inventory.js";
import { Attack } from "../Animations/Attack.js";
import { Tree } from "../../levels/parts/Tree/Tree.js";
import { Stone } from "../../levels/parts/Stone/Stone.js";
import { Bush } from "../../levels/parts/Bush/Bush.js";

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
      vFrames: 12,
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
        // damageDown: new FrameIndexPattern(DAMAGE_DOWN),
        // damageRight: new FrameIndexPattern(DAMAGE_RIGHT),
        // damageUp: new FrameIndexPattern(DAMAGE_UP),
        // damageLeft: new FrameIndexPattern(DAMAGE_LEFT),
        attackWalkDown: new FrameIndexPattern(ATTACK_WALK_DOWN),
        attackWalkRight: new FrameIndexPattern(ATTACK_WALK_RIGHT),
        attackWalkUp: new FrameIndexPattern(ATTACK_WALK_UP),
        attackWalkLeft: new FrameIndexPattern(ATTACK_WALK_LEFT),
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

    //** --- PRESS: Space --- */ 
    if (input.getActionJustPressed("Space")) {

      // Look for an object at the next space (according to where Hero is facing)
      if (this.parent) {
        const objAtPosition = this.parent.children.find((child) => {
          return child.position.matches(
            this.position.toNeighbor(this.facingDirection)
          );
        });

        if (objAtPosition && !(objAtPosition instanceof Hero)) {
          events.emit(HERO_REQUESTS_ACTION, objAtPosition);
        }
      }
    }

    //** --- PRESS: KeyF (attack) --- */ 
    if (input.getActionJustPressed("KeyF")) {

      // Equipment laden
      const equip = SaveGame.loadEquipment();

      // Aktuell ausgerüstetes Equipment finden
      const activeIndex = equip.findIndex(item => item.active === true);

      // Wenn aktives Equipment gefunden dann passende Attack animation
      let attack: Attack;
      if (equip[activeIndex] && equip[activeIndex].name) {

        switch (equip[activeIndex].name) {
          case "rodPurple":
            attack = new Attack(this.facingDirection, "rodAttackPurple");
            break;

          case "rodRed":
            attack = new Attack(this.facingDirection, "rodAttackRed");
            break;

          default:
            attack = new Attack(this.facingDirection, equip[activeIndex].name);
            break;
        }

        this.addChild(attack);
      }

      // Wenn GameObject an benachbarter Position von Typ Tree, Stone, Bush
      // dann HERO_ATTACK_ACTION Event triggern
      if (this.parent) {
        const objAtPosition = this.parent.children.find((child) => {
          return child.position.matches(
            this.position.toNeighbor(this.facingDirection)
          );
        });

        if (
          objAtPosition && (
            objAtPosition instanceof Tree
            || objAtPosition instanceof Stone
            || objAtPosition instanceof Bush
          )
        ) {
          events.emit(HERO_ATTACK_ACTION, objAtPosition);
        }
      }
    }

    //** --- PRESS: KeyQ (change weapon)--- */ 
    if (input.getActionJustPressed("KeyQ")) {
      events.emit(HERO_CHANGE_EQUIPMENT, this);
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

    if (this.body.animations) {
      switch (input.direction) {
        case LEFT:
          nextX -= TILE_SIZE;
          this.body.animations.play("walkLeft");
          break;
        case RIGHT:
          nextX += TILE_SIZE;
          this.body.animations.play("walkRight");
          break;
        case UP:
          nextY -= TILE_SIZE;
          this.body.animations.play("walkUp");
          break;
        case DOWN:
          nextY += TILE_SIZE;
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

      if (INVENTORY_ITEMS.includes(data.imageKey)) {
        this.itemPickUpTime = 300; // ms
      }

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
