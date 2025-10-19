import { gridCells, TILE_SIZE } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Exit } from "../objects/Exit/Exit.js";
import { Hero } from "../objects/Hero/Hero.js";
import { BUSH, Item, STONE, TREE } from "../objects/Item/Item.js";
import { events, HERO_EXITS, CHANGE_LEVEL } from "../Events.js";
import { CaveLevel1 } from "./CaveLevel1.js";
import { SaveGame } from "../SaveGame.js";
import { LevelId } from "../helpers/levelRegistry.js";
import { Tree } from "./parts/Tree/Tree.js";
import { Stone } from "./parts/Stone/Stone.js";
import { Square } from "./parts/Square/Square.js";
import { Water } from "./parts/Water/Water.js";
import { Bush } from "./parts/Bush/Bush.js";
import { House } from "./parts/House/House.js";
import { generateDefaultResources } from "../helpers/generateResources.js";
import { Npc } from "../objects/Npc/Npc.js";
import { GameObject } from "../GameObject.js";

export class OutdoorLevel1 extends Level {

  levelId: LevelId = "OutdoorLevel1";
  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;
  defaultHeroPosition = new Vector2(gridCells(60), gridCells(21));

  constructor(position: Vector2) {
    // Ohne Sound // super(position);
    // mit Sound // super(position, "./sounds/levels/OutdoorLevel1.mp3", 0.4);
    super(position, "./sounds/levels/background_music_02.mp3", 0.2);

    // Initialisierung des Sounds (abhängig vom SaveGame)
    this.initBackgroundSound();

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.outdoorSky,
      frameSize: new Vector2(320, 180),
      position: new Vector2(0, 0)
    });

    // Choose actual Level Ground
    const groundSprite = new Sprite({
      resource: resources.images.outdoorGround,
      frameSize: new Vector2(1600, 800),
      position: new Vector2(0, 0)
    });
    this.addChild(groundSprite);

    //** --- Check if Quest's finished --- */
    this.checkGameProgress();

    //** --- Build "purpleRod" Scene  --- */
    this.buildLevelGroupPurpleRod();

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
      right: this.generateWall(new Vector2(1568, 32), new Vector2(1568, 764), TILE_SIZE, "right"),
      left: this.generateWall(new Vector2(16, 32), new Vector2(16, 764), TILE_SIZE, "left"),
      top: this.generateWall(new Vector2(32, 16), new Vector2(1568, 16), TILE_SIZE, "top"),
      bottom: this.generateWall(new Vector2(32, 768), new Vector2(1568, 768), TILE_SIZE, "bottom"),
    };
    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {

      // Alten Level-Sound stoppen
      this.stopBackgroundSound();

      // Hero position im neuen Level
      const heroPosition = new Vector2(gridCells(35), gridCells(33));

      // Hero laden/speichern
      // - exp speichern
      // - Position festlegen
      // - Level festlegen
      const hero = SaveGame.loadHero();
      if (hero) {
        SaveGame.saveHero(hero.level, heroPosition, hero.exp);

        events.emit(CHANGE_LEVEL, new CaveLevel1(new Vector2(gridCells(0), gridCells(0))));
      }
    });
  }

  /**
   * Erstelle alle Elemente die zur "lila Zauberstab" Scene gehören
   * - purple Rod
   * - Npc for Quest
   * - Square to block path
   * - Resources
   */
  buildLevelGroupPurpleRod() {
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
          string: "Danke für das Holz. Jetzt kannst du noch schneller Resourcen sammeln!  Sprich mit meinem Bruder wenn du Zeit findest.",
          requires: ["STORY_01_PART_01"], // any string in the List must exists in our available list of storyflags
          // bypass: [], // if we have done any of this storyflags then we dont show this message
          // storyFlag: "STORY_01_PART_02", // add string to list of known flags
        },
        {
          string: "Bringe mir 5x Holz und ich gebe dir einen Zauberstab der mehr Schaden austeilt!",
          // requires: [], // any string in the List must exists in our available list of storyflags
          // bypass: [], // if we have done any of this storyflags then we dont show this message
          storyFlag: "STORY_01_PART_01", // add string to list of known flags
        }
      ],
    );

    //** --- Check if Quest "rodPurple" is finished --- */
    if (SaveGame.isInEquipment("rodPurple")) {
      // NPC leicht nach link verschieben
      npc.position.x += gridCells(-1);
    }

    // Gruppe vorbereiten
    const rodPurpleGroup: GameObject[] = [
      // add Npc
      npc,

      // Schrein horizontal Begrenzung
      new Square(gridCells(4), gridCells(3)),
      new Square(gridCells(5), gridCells(3)),
      new Square(gridCells(6), gridCells(3)),
      new Square(gridCells(4), gridCells(7)),
      new Square(gridCells(6), gridCells(7)),

      // Schrein vertical Begrenzung
      new Square(gridCells(3), gridCells(4)),
      new Square(gridCells(3), gridCells(5)),
      new Square(gridCells(3), gridCells(6)),
      new Square(gridCells(7), gridCells(4)),
      new Square(gridCells(7), gridCells(5)),
      new Square(gridCells(7), gridCells(6)),
    ];

    //** --- Wenn noch kein "rodPurple" im Equipment dann "rodPurple" in der Scene platzieren --- */
    if (!SaveGame.isInEquipment("rodPurple")) {
      const rod = new Item(gridCells(5), gridCells(5), "rodPurple");
      rodPurpleGroup.push(rod);
    }

    /** --- Gruppe: "lila Zauberstab" erzeugen --- */
    this.addChildrenGroup(
      "lila Zauberstab",
      gridCells(34), // Platziere Gruppe links/rechts
      gridCells(6), // Platziere Gruppe oben/unten
      rodPurpleGroup,
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
   * Erstelle alle Elemente die zur "Exit" Scene gehören
   * - Exit
   * - House
   * - Resources
   */
  buildLevelGroupExit() {
    // Exit Gruppe vorbereiten
    const exitGroup: GameObject[] = [
      // Exit
      new Exit(gridCells(3), gridCells(3)),

      // House
      new House(gridCells(7), gridCells(6)),

      // Water
      new Water(gridCells(3), gridCells(6)),
      new Water(gridCells(4), gridCells(6)),
      new Water(gridCells(5), gridCells(6)),
      new Water(gridCells(6), gridCells(6)),
    ];

    this.addChildrenGroup(
      "Exit Gruppe",
      gridCells(7), // Platziere Gruppe links/rechts
      gridCells(6), // Platziere Gruppe oben/unten
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
      levelId: "OutdoorLevel1",
      width: 1600,
      height: 800,
      seed: 3, // bestimmter Seed = immer gleiche Karte
      pathZones: [

        // füge Gruppenbasierte freie flächen hinzu
        ...this.noResourceZones,

        // Start Position Spieler
        { x1: 58, x2: 62, y1: 19, y2: 19 },
        { x1: 57, x2: 63, y1: 20, y2: 20 },
        { x1: 56, x2: 64, y1: 21, y2: 21 },
        { x1: 57, x2: 63, y1: 22, y2: 22 },
        { x1: 58, x2: 62, y1: 23, y2: 23 },

        // horizontaler Pfad 1600/16 = 100 gridCells
        { x1: 11, x2: 55, y1: 20, y2: 22 },

        // vertikaler Pfad
        // { x1: 50, x2: 55, y1: 0, y2: 56 },    
      ],
      density: {
        Tree: 0.500,
        Bush: 0.200,
        Stone: 0.100
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
          case BUSH: this.addChild(new Bush(res.x, res.y, res.hp)); break;
          case TREE: this.addChild(new Tree(res.x, res.y, res.hp)); break;
          case STONE: this.addChild(new Stone(res.x, res.y, res.hp)); break;
        }
      }
    }
  }
}
