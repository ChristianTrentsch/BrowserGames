import { gridCells, TILE_SIZE } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Exit } from "../objects/Exit/Exit.js";
import { Hero } from "../objects/Hero/Hero.js";
import { events, HERO_EXITS, CHANGE_LEVEL } from "../Events.js";
import { OutdoorLevel1 } from "./OutdoorLevel1.js";
import { Npc } from "../objects/Npc/Npc.js";
import { Item } from "../objects/Item/Item.js";
import { SaveGame } from "../SaveGame.js";
import { LevelId } from "../helpers/levelRegistry.js";
import { GameObject } from "../GameObject.js";
import { generateDefaultResources } from "../helpers/generateResources.js";
import { Tree } from "./parts/Tree/Tree.js";
import { Bush } from "./parts/Bush/Bush.js";
import { Stone } from "./parts/Stone/Stone.js";

export class CaveLevel1 extends Level {

  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;
  defaultHeroPosition = new Vector2(gridCells(5), gridCells(2));
  levelId: LevelId = "CaveLevel1";   // eindeutige ID

  constructor({ position, heroPosition }: {
    position: Vector2;
    heroPosition?: Vector2;
  }) {
    // Ohne Sound // super(position);
    // mit Sound
    super(position, "./sounds/levels/CaveLevel1.mp3", 0.2);

    // Initialisierung des Sounds (abhängig vom SaveGame)
    this.initBackgroundSound();

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.caveSky,
      frameSize: new Vector2(320, 180),
      position: new Vector2(0, 0)
    });

    // Choose actual Level Ground
    const groundSprite = new Sprite({
      resource: resources.images.caveGround,
      frameSize: new Vector2(320, 180),
      position: new Vector2(0, 0)
    });
    this.addChild(groundSprite);

    //** --- Check if Quest's finished --- */
    this.checkGameProgress();

    //** --- Build "redRod" Scene  --- */
    this.buildLevelGroupRedRod();

    //** --- Resourcen laden --- */
    this.loadLevelResources();

    //** --- Create Hero and add to scene --- */
    // entweder geladene Position (Reload) oder die übergebene Startposition (Levelwechsel)
    this.heroStartPosition = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    //** --- Create Level walls add to scene --- */
    const wallDefinitions = {
      right: this.generateWall(new Vector2(288, 16), new Vector2(288, 112), TILE_SIZE, "right"),
      left: this.generateWall(new Vector2(16, 16), new Vector2(16, 112), TILE_SIZE, "left"),
      top: this.generateWall(new Vector2(32, 0), new Vector2(272, 0), TILE_SIZE, "top"),
      bottom: this.generateWall(new Vector2(32, 128), new Vector2(272, 128), TILE_SIZE, "bottom"),
      stone: ["144,16", "192,32", "208,32", "208,48", "256,80", "32,64",],
      littleStone: ["48,64", "48,80",],
      squares: ["48,13", "64,16", "80,48", "96,48", "128,48", "112,64", "96,64", "192,80", "208,80", "224,96",],
      water: ["240,32", "256,32", "208,96", "192,96", "176,96", "128,96", "112,96", "96,96",],
    };
    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {

      // console.log("CHANGE LEVEL", this);

      // Alten Level-Sound stoppen
      this.stopBackgroundSound();

      events.emit(
        CHANGE_LEVEL,
        new OutdoorLevel1(
          {
            position: new Vector2(gridCells(0), gridCells(0)),
            heroPosition: new Vector2(gridCells(11), gridCells(10)), // feste Startposition
          })
      );
    });
  }

  /**
     * Erstelle alle Elemente die zur "roter Zauberstab" Scene gehören
     * - red Rod
     * - Npc for Quest
     */
  buildLevelGroupRedRod() {
    let npc = new Npc(
      gridCells(7),
      gridCells(2),
      [
        {
          string: "Du hast nun die stärkste Waffe und keine Resource kann dich aufhalten",
          requires: ["STORY_01_PART_01", "STORY_02_PART_01"], // any string in the List must exists in our available list of storyflags
          // bypass: [], // if we have done any of this storyflags then we dont show this message
          // storyFlag: "STORY_01_PART_02", // add string to list of known flags
        },
        {
          string: "Bringe mir 20x Blätter, 25x Holz, 10x Steine und die ultimative Waffe gehört dir!",
          requires: ["STORY_01_PART_01"], // any string in the List must exists in our available list of storyflags
          // bypass: ["STORY_01_PART_01"], // if we have done any of this storyflags then we dont show this message
          storyFlag: "STORY_02_PART_01", // add string to list of known flags
        },
        {
          string: "Sprich zuerst mit meinem Bruder!",
          // requires: [], // any string in the List must exists in our available list of storyflags
          // bypass: ["STORY_01_PART_01"], // if we have done any of this storyflags then we dont show this message
          // storyFlag: "STORY_02_PART_01", // add string to list of known flags
        }
      ],
    );

    //** --- Check if Quest "rodRed" is finished --- */
    if (SaveGame.isInEquipment("rodRed")) {
      // NPC leicht nach link verschieben
      npc.position.x += gridCells(-1);
    }

    // Gruppe vorbereiten
    const rodRedGroup: GameObject[] = [
      // add Npc
      npc,
      new Exit(gridCells(17), gridCells(7)),
    ];

    //** --- Wenn noch kein "rodRed" im Equipment dann "rodRed" in der Scene platzieren --- */
    if (!SaveGame.isInEquipment("rodRed")) {
      const rod = new Item(gridCells(7), gridCells(3), "rodRed");
      rodRedGroup.push(rod);
    }

    /** --- Gruppe: "roter Zauberstab" erzeugen --- */
    this.addChildrenGroup(
      "roter Zauberstab",
      gridCells(0), // Platziere Gruppe links/rechts
      gridCells(0), // Platziere Gruppe oben/unten
      rodRedGroup,
      [
        // Resourcen freie Zone definieren
        {
          x1: 0, // links
          x2: 10,// rechts
          y1: 0, // oben
          y2: 10, // unten
        },
      ],
    );
  }

  /**
     * Lade alle für dieses Level relevante Resource
     * - default Resources
     * - saved Resources
     * - merge default and saved Resources
     * - create merged Resources
     */
  loadLevelResources() {
    // Default-Resourcen-Definition im Level
    const defaultResources = generateDefaultResources({
      levelId: "CaveLevel1",
      width: 320,
      height: 180,
      seed: 1, // bestimmter Seed = immer gleiche Karte
      pathZones: [
        ...this.noResourceZones, // füge Gruppenbasierte freie flächen hinzu
      ],
      density: {
        Tree: 0, // keine Resourcen erzeugen
        Bush: 0, // keine Resourcen erzeugen
        Stone: 0, // keine Resourcen erzeugen
      },
      border: 0
    });

    // Geladene Savegame-Daten
    const savedResources = SaveGame.loadResources(this.levelId);

    // Merging Logik
    const mergedResources = defaultResources.map(def => {
      const saved = savedResources.find(s => s.x === def.x && s.y === def.y && s.type === def.type);
      return saved ? { ...def, ...saved } : def;
    });

    // Resourcen anhand der Daten setzen (saved Data / default Data)
    for (const res of mergedResources) {
      if (res.hp > 0) {
        switch (res.type) {
          case "Tree": this.addChild(new Tree(res.x, res.y, res.hp)); break;
          case "Bush": this.addChild(new Bush(res.x, res.y, res.hp)); break;
          case "Stone": this.addChild(new Stone(res.x, res.y, res.hp)); break;
        }
      }
    }
  }
}
