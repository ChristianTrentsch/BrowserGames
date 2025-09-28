import { GameObject } from "../../GameObject.js";
import { Camera } from "../../Camera.js";
import { Input } from "../../Input.js";
import { Inventory } from "../Inventory/Inventory.js";
import {
  events,
  CHANGE_LEVEL,
  HERO_REQUESTS_ACTION,
  TEXTBOX_START,
  TEXTBOX_END,
  HERO_ATTACK_ACTION,
} from "../../Events.js";
import { SpriteTextString } from "../SpriteTextString/SpriteTextString.js";
import { Npc } from "../Npc/Npc.js";
import { Level } from "../Level/Level.js";
import { Vector2 } from "../../Vector2.js";
import { SaveGame } from "../../SaveGame.js";
import { Tree } from "../../levels/parts/Tree/Tree.js";
import { Bush } from "../../levels/parts/Bush/Bush.js";
import { Stone } from "../../levels/parts/Stone/Stone.js";

export class Main extends GameObject {
  level: null | Level;
  input: Input;
  camera: Camera;

  constructor(position: Vector2) {
    super(position);

    this.level = null;
    this.input = new Input();
    this.camera = new Camera(new Vector2(0, 0));
  }

  ready() {
    const inventory = new Inventory();
    this.addChild(inventory);

    // Change the level
    events.on(CHANGE_LEVEL, this, (newLevelInstance: Level) => {
      SaveGame.saveLevel(newLevelInstance.levelId);
      this.setLevel(newLevelInstance);
    });

    // Check for hero action
    events.on(HERO_REQUESTS_ACTION, this, (withObject) => {
      if (typeof withObject.getContent === "function") {

        // max content length to fit in textbox sprite is 153
        const content = withObject.getContent();
        const textbox = new SpriteTextString(content.portraitFrame, content.string);

        this.addChild(textbox);
        events.emit(TEXTBOX_START);

        // Unsubscribe from this textbox after it's destroyed
        const endingSub = events.on(TEXTBOX_END, this, () => {
          textbox.destroy();
          events.off(endingSub);
        });
      }
    });

    events.on(HERO_ATTACK_ACTION, this, (withObject) => {

      if (withObject instanceof Tree || withObject instanceof Stone || withObject instanceof Bush) {
        withObject.destroy();
      }

    });
  }

  setLevel(newLevelInstance: Level) {
    // Delete old level before create new one
    if (this.level) {
      this.level.destroy();
    }
    this.level = newLevelInstance;
    this.addChild(this.level);
  }

  drawBackground(ctx: CanvasRenderingContext2D) {
    // ...
    if (this.level) {
      this.level.background.drawImage(ctx, this.level.background.position.x, this.level.background.position.x);
    }
  }

  drawObjects(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => {
      if (child.drawLayer !== "HUD") {
        child.draw(ctx, child.position.x, child.position.x);
      }
    });
  }

  drawForeground(ctx: CanvasRenderingContext2D) {
    this.children.forEach((child) => {
      if (child.drawLayer === "HUD") {
        child.draw(ctx, child.position.x, child.position.x);
      }
    });
  }
}
