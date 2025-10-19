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
import { ResourceSaveData, SaveGame } from "../../SaveGame.js";
import { Tree } from "../../levels/parts/Tree/Tree.js";
import { Bush } from "../../levels/parts/Bush/Bush.js";
import { Stone } from "../../levels/parts/Stone/Stone.js";
import { Equipment } from "../Equipment/Equipment.js";
import { storyFlags } from "../../StoryFlags.js";
import { Npc } from "../Npc/Npc.js";
import { gridCells } from "../../helpers/grid.js";
import { Exp } from "../Exp/Exp.js";

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

    const exp = new Exp();
    this.addChild(exp);

    // Change the level
    events.on(CHANGE_LEVEL, this, (newLevelInstance: Level) => {

      // neues Level speichern
      SaveGame.saveLevel(newLevelInstance.levelId);

      this.setLevel(newLevelInstance);
    });

    // Check for hero action
    events.on(HERO_REQUESTS_ACTION, this, (withObject) => {

      // Wenn keine getContent function dann raus
      if (typeof withObject.getContent !== "function") return;

      // Prüfen ob Npc
      if (withObject instanceof Npc) {

        // aktuelle Scenario
        const scenarios = withObject.getContent();

        // nach storyFlag schauen
        const flag = scenarios?.storyFlag ?? null;

        // Inventar überprüfen auf Questbedingung
        switch (flag) {
          case "STORY_01_PART_01":
            if (inventory.completeQuest([{ name: "tree", amount: 5 }])) {
              // Story-Flag setzen
              storyFlags.add(flag);
              // console.log(flag);

              // Falls StoryFlags persistierst:
              // TODO: SaveGame erweitert um Status der gelösten Quests zu speichern

              // Npc verschieben
              withObject.position.x += gridCells(-1);

              // Optional: Sound/Effekt
              // TODO: neuen Sound beim lösen der Quest
            }
            break;

          case "STORY_02_PART_01":
            if (inventory.completeQuest([
              { name: "tree", amount: 25 },
              { name: "bush", amount: 20 },
              { name: "stone", amount: 10 }
            ])) {
              // Story-Flag setzen
              storyFlags.add(flag);
              // console.log(flag);

              // Falls StoryFlags persistierst:
              // TODO: SaveGame erweitert um Status der gelösten Quests zu speichern

              // Npc verschieben
              withObject.position.x += gridCells(-1);

              // Optional: Sound/Effekt
              // TODO: neuen Sound beim lösen der Quest
            }
            break;

          default:
            break;
        }
      }

      // Jetzt holen wir den aktuell passenden Content (nach eventuellen Änderungen oben)
      const content = withObject.getContent();
      if (!content) {
        return;
      }

      // Textbox erstellen und anzeigen
      const textbox = new SpriteTextString(content.portraitFrame, content.string);
      this.addChild(textbox);

      events.emit(TEXTBOX_START);

      // Unsubscribe from this textbox after it's destroyed
      const endingSub = events.on(TEXTBOX_END, this, () => {
        textbox.destroy();
        events.off(endingSub);
      });

    });

    events.on(HERO_ATTACK_ACTION, this, (withObject: Tree | Stone | Bush) => {

      // HP reduzieren basierend auf Waffe
      withObject.healthPoints -= equipment.getActiveDamage();

      // abfangen wenn Schaden größer als verfügbare HP
      if (withObject.healthPoints <= 0) {
        withObject.healthPoints = 0; // keine negative HP speichern
      }

      if (this.level) {
        this.pushResource(withObject);
        SaveGame.saveResources(this.level.levelId, this.savedResources);
      }

    });
  }

  pushResource(withObject: Tree | Stone | Bush) {
    const existing = this.savedResources.find(
      r => r.type === withObject.type &&
        r.x === withObject.position.x &&
        r.y === withObject.position.y
    );

    if (existing) {
      // Wenn schon vorhanden, nur hp aktualisieren
      existing.hp = withObject.healthPoints;
    } else {
      // Ansonsten neues Objekt speichern
      this.savedResources.push({
        type: withObject.type,
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

    // Resourcen des neuen Levels laden
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
