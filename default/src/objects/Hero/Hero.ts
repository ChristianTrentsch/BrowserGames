import { moveTowards } from "../../helpers/moveTowards.js";
import { TILE_SIZE, gridCells, isSpaceFree } from "../../helpers/grid.js";
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
  HERO_CHANGE_EQUIPMENT,
  EventCollectible,
  RES_DESTROY,
  HERO_EXITS,
  CHANGE_LEVEL,
  HERO_CHANGE_EXP,
} from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { DOWN, LEFT, RIGHT, UP } from "../../Input.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { Animations, HeroAnimationKey } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { Main } from "../Main/Main.js";
import { Direction } from "../../types.js";
import { SaveGame } from "../../SaveGame.js";
import { Attack } from "../Animations/Attack.js";
import { Tree } from "../../levels/parts/Tree/Tree.js";
import { Stone } from "../../levels/parts/Stone/Stone.js";
import { Bush } from "../../levels/parts/Bush/Bush.js";
import { BUSH, Item, STONE, TREE } from "../Item/Item.js";
import { Level } from "../Level/Level.js";
import { Exp } from "../Exp/Exp.js";

export const LEVEL_THRESHOLDS = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
  310, 320, 330, 340, 350, 360, 370, 380, 390, 400,
  410, 420, 430, 440, 450, 460, 470, 480, 490, 500,
  510, 520, 530, 540, 550, 560, 570, 580, 590, 600,
  610, 620, 630, 640, 650, 660, 670, 680, 690, 700,
  710, 720, 730, 740, 750, 760, 770, 780, 790, 800,
  810, 820, 830, 840, 850, 860, 870, 880, 890, 900,
  910, 920, 930, 940, 950, 960, 970, 980, 990, 1000,
];

export class Hero extends GameObject {

  body: Sprite;
  facingDirection: Direction;
  destinationPosition: Vector2;
  itemPickUpTime: number;
  itemPickUpShell: null | GameObject;
  isLocked: boolean;
  exp: number;
  level: number;

  lastX?: number;
  lastY?: number;

  constructor(x: number, y: number, exp: number, level: number) {
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
      animations: new Animations<HeroAnimationKey>({
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
    this.exp = exp;
    this.level = level;
  }

  ready() {
    // Hero picks up item
    events.on(HERO_PICKS_UP_ITEM, this, (data: EventCollectible) => {
      this.onPickUpItem(data);
    });

    // Hero destroy Resource
    events.on(RES_DESTROY, this, (resource: Bush | Tree | Stone) => {
      this.onHeroGainExp(resource);
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
      if (equip[activeIndex] && equip[activeIndex].name) {
        this.addChild(new Attack(this.facingDirection, equip[activeIndex].name));
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
          SaveGame.saveHero(this.level, this.destinationPosition, this.exp);
        }
      }
    }
  }

  onHeroGainExp(resource: Bush | Tree | Stone) {

    // Hero Erfahrungspunkte geben abhängig zur Resource
    this.exp += resource.xp;


    const nextLevelExp = LEVEL_THRESHOLDS[this.level];

    if (nextLevelExp && this.exp >= nextLevelExp && this.level < LEVEL_THRESHOLDS.length - 1) {

      // level erhöhen
      this.level++;

      // Xp zurücksetzen
      this.exp = 0;
    }

    SaveGame.saveHero(this.level, this.position, this.exp);

    // Daten für Exp class bereit stellen
    events.emit(HERO_CHANGE_EXP, {
      exp: this.exp,
      level: this.level,
      heroPos: this.position
    });
  }

  onPickUpItem(data: EventCollectible) {

    // Make sure we land right on the item
    const position = data.position;
    if (position) {
      this.destinationPosition = position.duplicate();

      // Start the pickup animation
      this.itemPickUpTime = 1000; // ms

      if (data.name === BUSH || data.name === TREE || data.name === STONE) {
        this.itemPickUpTime = 200; // ms
      }

      // Play pick up sound from Item
      const isSoundOn = SaveGame.loadSound();
      if (isSoundOn === "on") {
        data.itemSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
      }

      const image = data.image;
      if (image) {

        // Bild passend zum Item ermitteln
        const frame = Item.getCollectibleItemFrame(data.name);

        // Pick Up Hülle erzeugen
        this.itemPickUpShell = new GameObject(new Vector2(0, 0));
        this.itemPickUpShell.addChild(
          new Sprite({
            resource: resources.images.collectible,
            position: new Vector2(0, -19), // show item image above head of hero
            hFrames: 20,
            frame: frame,
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
