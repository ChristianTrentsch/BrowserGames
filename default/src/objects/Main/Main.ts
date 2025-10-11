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
import { Level } from "../Level/Level.js";
import { Vector2 } from "../../Vector2.js";
import { ResourceSaveData, ResourceType, SaveGame } from "../../SaveGame.js";
import { Tree } from "../../levels/parts/Tree/Tree.js";
import { Bush } from "../../levels/parts/Bush/Bush.js";
import { Stone } from "../../levels/parts/Stone/Stone.js";
import { Equipment } from "../Equipment/Equipment.js";

export class Main extends GameObject {
  level: null | Level;
  input: Input;
  camera: Camera;

  savedResources: ResourceSaveData[];

  constructor(position: Vector2) {
    super(position);

    this.level = null;
    this.input = new Input();
    this.camera = new Camera(new Vector2(0, 0));

    this.savedResources = [];
  }

  ready() {
    const inventory = new Inventory();
    this.addChild(inventory);

    const equipment = new Equipment();
    this.addChild(equipment);

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
        
        // HP ressource veringern
        withObject.healthPoints -= 1;

        if (this.level) {
          this.pushResource(withObject);
          SaveGame.saveResources(this.level.levelId, this.savedResources);
        }
      }
    });
  }

  pushResource(withObject: Tree | Stone | Bush) {
    const existing = this.savedResources.find(
      r => r.type === withObject.constructor.name &&
        r.x === withObject.position.x &&
        r.y === withObject.position.y
    );

    if (existing) {
      // Wenn schon vorhanden, nur hp aktualisieren
      existing.hp = withObject.healthPoints;
    } else {
      // Ansonsten neues Objekt speichern
      this.savedResources.push({
        type: withObject.constructor.name as ResourceType,
        x: withObject.position.x,
        y: withObject.position.y,
        hp: withObject.healthPoints
      });
    }
  }

  setLevel(newLevelInstance: Level) {
    // Delete old level before create new one
    if (this.level) {
      this.level.destroy();
    }
    this.level = newLevelInstance;
    this.addChild(this.level);

    // Ressourcen des neuen Levels laden
    this.savedResources = SaveGame.loadResources(this.level.levelId) ?? [];
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
