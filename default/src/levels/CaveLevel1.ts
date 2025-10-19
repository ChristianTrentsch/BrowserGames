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
import { BUSH, Item, STONE, TREE } from "../objects/Item/Item.js";
import { SaveGame } from "../SaveGame.js";
import { LevelId, levelRegistry } from "../helpers/levelRegistry.js";
import { GameObject } from "../GameObject.js";
import { generateDefaultResources } from "../helpers/generateResources.js";
import { Tree } from "./parts/Tree/Tree.js";
import { Bush } from "./parts/Bush/Bush.js";
import { Stone } from "./parts/Stone/Stone.js";
import { Square } from "./parts/Square/Square.js";

export class CaveLevel1 extends Level {

  levelId: LevelId = "CaveLevel1";
  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;
  defaultHeroPosition = new Vector2(gridCells(16), gridCells(6));

  constructor(position: Vector2) {
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
      resource: resources.images.desertGround,
      frameSize: new Vector2(1600, 1600),
      position: new Vector2(0, 0)
    });
    this.addChild(groundSprite);

    //** --- Check if Quest's finished --- */
    this.checkGameProgress();

    //** --- Build "redRod" Scene  --- */
    this.buildLevelGroupRedRod();

    //** --- Build Exit Scene --- */
    this.buildLevelGroupExit();

    //** --- Resourcen laden --- */
    this.loadLevelResources();

    //** --- Load Hero Data --- */
    this.heroStartPosition = this.defaultHeroPosition;
    // const heroSave = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const heroSave = SaveGame.loadHero();
    let exp = 0;
    let level = 0;
    if (heroSave) {
      this.heroStartPosition = heroSave.pos ?? this.defaultHeroPosition;
      exp = heroSave.exp;
      level = heroSave.level;
    }

    //** --- Create Hero and add to scene --- */
    const hero = new Hero(
      this.heroStartPosition.x,
      this.heroStartPosition.y,
      exp,
      level
    );
    this.addChild(hero);

    //** --- Create Level walls add to scene --- */
    const wallDefinitions = {
      right: this.generateWall(new Vector2(1568, 32), new Vector2(1568, 1564), TILE_SIZE, "right"),
      left: this.generateWall(new Vector2(16, 32), new Vector2(16, 1564), TILE_SIZE, "left"),
      top: this.generateWall(new Vector2(32, 16), new Vector2(1568, 16), TILE_SIZE, "top"),
      bottom: this.generateWall(new Vector2(32, 1564), new Vector2(1568, 1564), TILE_SIZE, "bottom"),
    };
    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {

      // Alten Level-Sound stoppen
      this.stopBackgroundSound();

      // Hero position im neuem Level
      const heroPosition = new Vector2(gridCells(84), gridCells(14));

      // Hero laden/speichern
      // - exp speichern
      // - Position festlegen
      // - Level festlegen
      const hero = SaveGame.loadHero();
      if (hero) {
        SaveGame.saveHero(hero.level, heroPosition, hero.exp);

        events.emit(CHANGE_LEVEL, new OutdoorLevel1(new Vector2(0, 0)));
      }
    });
  }

  /**
     * Erstelle alle Elemente die zur "roter Zauberstab" Scene gehören
     * - red Rod
     * - Npc for Quest
     */
  buildLevelGroupRedRod() {
    let npc = new Npc(
      gridCells(5),
      gridCells(8),
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

    const design = "desert";

    // Gruppe vorbereiten
    const rodRedGroup: GameObject[] = [
      // add Npc
      npc,

      // Schrein horizontal Begrenzung
      new Square(gridCells(4), gridCells(3), design),
      new Square(gridCells(5), gridCells(3), design),
      new Square(gridCells(6), gridCells(3), design),
      new Square(gridCells(4), gridCells(7), design),
      new Square(gridCells(6), gridCells(7), design),

      // Schrein vertical Begrenzung
      new Square(gridCells(3), gridCells(4), design),
      new Square(gridCells(3), gridCells(5), design),
      new Square(gridCells(3), gridCells(6), design),
      new Square(gridCells(7), gridCells(4), design),
      new Square(gridCells(7), gridCells(5), design),
      new Square(gridCells(7), gridCells(6), design),
    ];

    //** --- Wenn noch kein "rodRed" im Equipment dann "rodRed" in der Scene platzieren --- */
    if (!SaveGame.isInEquipment("rodRed")) {
      const rod = new Item(gridCells(5), gridCells(5), "rodRed");
      rodRedGroup.push(rod);
    }

    /** --- Gruppe: "roter Zauberstab" erzeugen --- */
    this.addChildrenGroup(
      "roter Zauberstab",
      gridCells(8), // Platziere Gruppe links/rechts
      gridCells(8), // Platziere Gruppe oben/unten
      rodRedGroup,
      [
        // Resourcen freie Zone definieren

        /** --- OBEN --- */
        {
          x1: 4, // links
          x2: 6,// rechts
          y1: 0, // oben
          y2: 0, // unten
        },
        {
          x1: 3, // links
          x2: 7,// rechts
          y1: 1, // oben
          y2: 1, // unten
        },
        {
          x1: 2, // links
          x2: 8,// rechts
          y1: 2, // oben
          y2: 2, // unten
        },
        {
          x1: 1, // links
          x2: 9,// rechts
          y1: 3, // oben
          y2: 3, // unten
        },
        /** --- MITTE --- */
        {
          x1: 0, // links
          x2: 10,// rechts
          y1: 4, // oben
          y2: 6, // unten
        },
        /** --- UNTEN --- */
        {
          x1: 1, // links
          x2: 9,// rechts
          y1: 7, // oben
          y2: 7, // unten
        },
        {
          x1: 2, // links
          x2: 8,// rechts
          y1: 8, // oben
          y2: 8, // unten
        },
        {
          x1: 3, // links
          x2: 7,// rechts
          y1: 9, // oben
          y2: 9, // unten
        },
        {
          x1: 4, // links
          x2: 6,// rechts
          y1: 10, // oben
          y2: 10, // unten
        },
        /** --- EINGANG --- */
        // {
        //   x1: 4, // links
        //   x2: 6,// rechts
        //   y1: 10, // oben
        //   y2: 13, // unten
        // },
      ],
    );
  }

  /**
   * Erstelle alle Elemente die zur "Exit" Scene gehören
   * - Exit
   * - House
   * - Resources
   */
  buildLevelGroupExit() {
    // Exit Gruppe vorbereiten
    const exitGroup: GameObject[] = [
      // Exit
      new Exit(gridCells(4), gridCells(4)),
    ];

    this.addChildrenGroup(
      "Exit Gruppe",
      gridCells(30), // Platziere Gruppe links/rechts
      gridCells(30), // Platziere Gruppe oben/unten
      exitGroup,
      [
        // Resourcen freie Zone definieren

        /** --- OBEN --- */
        {
          x1: 3, // links
          x2: 7,// rechts
          y1: 1, // oben
          y2: 1, // unten
        },
        {
          x1: 2, // links
          x2: 8,// rechts
          y1: 2, // oben
          y2: 2, // unten
        },
        {
          x1: 1, // links
          x2: 9,// rechts
          y1: 3, // oben
          y2: 3, // unten
        },
        /** --- MITTE --- */
        {
          x1: 2, // links
          x2: 8,// rechts
          y1: 4, // oben
          y2: 6, // unten
        },
        /** --- UNTEN --- */
        {
          x1: 1, // links
          x2: 9,// rechts
          y1: 7, // oben
          y2: 7, // unten
        },
        {
          x1: 2, // links
          x2: 8,// rechts
          y1: 8, // oben
          y2: 8, // unten
        },
        {
          x1: 3, // links
          x2: 7,// rechts
          y1: 9, // oben
          y2: 9, // unten
        },
        /** --- EINGANG --- */
        {
          x1: 4, // links
          x2: 6,// rechts
          y1: 10, // oben
          y2: 13, // unten
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
      width: 1600,
      height: 1600,
      seed: 1, // bestimmter Seed = immer gleiche Karte
      pathZones: [
        // füge Gruppenbasierte freie flächen hinzu
        ...this.noResourceZones,

        // verticaler Pfad
        { x1: 30, x2: 32, y1: 12, y2: 32 },

        // horizontal Pfad
        { x1: 20, x2: 29, y1: 12, y2: 13 },
      ],
      density: {
        Tree: 0.200, // keine Resourcen erzeugen
        Bush: 0.300, // keine Resourcen erzeugen
        Stone: 0.100, // keine Resourcen erzeugen
      },
      border: 32
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
          case BUSH: this.addChild(new Bush(res.x, res.y, res.hp, "desert")); break;
          case TREE: this.addChild(new Tree(res.x, res.y, res.hp, "desert")); break;
          case STONE: this.addChild(new Stone(res.x, res.y, res.hp, "desert")); break;
        }
      }
    }
  }
}
