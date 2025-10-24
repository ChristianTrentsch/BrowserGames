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
import { generateDefaultResources, generateDeko } from "../helpers/generateResources.js";
import { Npc } from "../objects/Npc/Npc.js";
import { GameObject } from "../GameObject.js";
import { Lamp } from "./parts/Lamp/Lamp.js";
import { Deko } from "./parts/Deko/Deko.js";
import { Animations, DekoIdleKey } from "../Animations.js";
import { FrameIndexPattern } from "../FrameIndexPattern.js";

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

    this.loadLevelDeko();

    this.loadStartSea();


    this.addChild(new Lamp(gridCells(50), gridCells(25)));
    this.addChild(new Sprite({
      resource: resources.images["animBushSmall"],
      position: new Vector2(gridCells(48), gridCells(25)),
      frame: 0,
      hFrames: 3,
      animations: new Animations({
        dekoIdle: new FrameIndexPattern({
          duration: 5000,
          frames: [
            {
              time: 0,
              frame: 0,
            },
            {
              time: 120,
              frame: 1,
            },
            {
              time: 240,
              frame: 0,
            },
            {
              time: 360,
              frame: 2,
            },
            {
              time: 480,
              frame: 0,
            },
          ],
        })
      }),
    }))


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

      // Start Island - Border
      startIslandTop1: this.generateWall(new Vector2(gridCells(48), gridCells(22)), new Vector2(gridCells(51), gridCells(22)), TILE_SIZE, "top"),
      startIslandTop2: this.generateWall(new Vector2(gridCells(52), gridCells(23)), new Vector2(gridCells(57), gridCells(23)), TILE_SIZE, "top"),
      startIslandTop3: this.generateWall(new Vector2(gridCells(44), gridCells(24)), new Vector2(gridCells(46), gridCells(24)), TILE_SIZE, "top"),
      startIslandTop4: this.generateWall(new Vector2(gridCells(44), gridCells(26)), new Vector2(gridCells(46), gridCells(26)), TILE_SIZE, "top"),
      startIslandLeft1: this.generateWall(new Vector2(gridCells(47), gridCells(23)), new Vector2(gridCells(47), gridCells(24)), TILE_SIZE, "left"),
      startIslandLeft2: this.generateWall(new Vector2(gridCells(47), gridCells(26)), new Vector2(gridCells(47), gridCells(26)), TILE_SIZE, "left"),
      startIslandRight1: this.generateWall(new Vector2(gridCells(52), gridCells(26)), new Vector2(gridCells(52), gridCells(26)), TILE_SIZE, "right"),
      startIslandBottom1: this.generateWall(new Vector2(gridCells(48), gridCells(27)), new Vector2(gridCells(51), gridCells(27)), TILE_SIZE, "bottom"),
      startIslandBottom2: this.generateWall(new Vector2(gridCells(52), gridCells(25)), new Vector2(gridCells(57), gridCells(25)), TILE_SIZE, "bottom"),

      // Start Lake - Border
      startLakeTop1: this.generateWall(new Vector2(gridCells(43), gridCells(19)), new Vector2(gridCells(58), gridCells(19)), TILE_SIZE, "top"),
      startLakeBottom1: this.generateWall(new Vector2(gridCells(43), gridCells(29)), new Vector2(gridCells(58), gridCells(29)), TILE_SIZE, "bottom"),

      startLakeLeft1: this.generateWall(new Vector2(gridCells(43), gridCells(20)), new Vector2(gridCells(43), gridCells(24)), TILE_SIZE, "left"),
      startLakeLeft2: this.generateWall(new Vector2(gridCells(43), gridCells(26)), new Vector2(gridCells(43), gridCells(28)), TILE_SIZE, "left"),
      startLakeRight1: this.generateWall(new Vector2(gridCells(58), gridCells(20)), new Vector2(gridCells(58), gridCells(23)), TILE_SIZE, "right"),
      startLakeRight2: this.generateWall(new Vector2(gridCells(58), gridCells(25)), new Vector2(gridCells(58), gridCells(28)), TILE_SIZE, "right"),

      // fakePfad: this.generateWall(new Vector2(gridCells(60), gridCells(32)), new Vector2(gridCells(85), gridCells(32)), TILE_SIZE, "bottom"),

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

        events.emit(CHANGE_LEVEL, new CaveLevel1(new Vector2(0, 0)));
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
      gridCells(8), // Platziere Gruppe links/rechts
      gridCells(8), // Platziere Gruppe oben/unten
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
      gridCells(80), // Platziere Gruppe links/rechts
      gridCells(10), // Platziere Gruppe oben/unten
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
        // oben
        { x1: 41, x2: 48, y1: 17, y2: 17 },
        { x1: 41, x2: 60, y1: 18, y2: 19 },
        // mitte
        { x1: 40, x2: 61, y1: 20, y2: 28 },
        // unten
        { x1: 41, x2: 58, y1: 29, y2: 29 },
        { x1: 41, x2: 53, y1: 30, y2: 30 },
        { x1: 42, x2: 49, y1: 31, y2: 31 },

        // horizontaler Pfad zum Exit
        { x1: 68, x2: 80, y1: 24, y2: 25 },

        // horizontaler Pfad zum lila Zauberstab
        { x1: 25, x2: 37, y1: 23, y2: 25 },
        { x1: 25, x2: 26, y1: 26, y2: 39 },
        { x1: 8, x2: 24, y1: 40, y2: 41 },
        { x1: 8, x2: 9, y1: 22, y2: 39 },
        { x1: 10, x2: 14, y1: 22, y2: 23 },
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

  loadLevelDeko() {
    // Default-Resourcen-Definition im Level
    const dekos = generateDeko({
      levelId: "OutdoorLevel1",
      width: 1600,
      height: 800,
      seed: 2, // bestimmter Seed = immer gleiche Karte
      pathZones: [

        // füge Gruppenbasierte freie flächen hinzu
        ...this.noResourceZones,

        // Start Position Spieler
        // oben
        { x1: 41, x2: 48, y1: 17, y2: 17 },
        { x1: 41, x2: 60, y1: 18, y2: 19 },
        // mitte
        { x1: 40, x2: 61, y1: 20, y2: 28 },
        // unten
        { x1: 41, x2: 58, y1: 29, y2: 29 },
        { x1: 41, x2: 53, y1: 30, y2: 30 },
        { x1: 42, x2: 49, y1: 31, y2: 31 },

        // horizontaler Pfad zum Exit
        { x1: 68, x2: 80, y1: 24, y2: 25 },

        // horizontaler Pfad zum lila Zauberstab
        { x1: 25, x2: 37, y1: 23, y2: 25 },
        { x1: 25, x2: 26, y1: 26, y2: 39 },
        { x1: 8, x2: 24, y1: 40, y2: 41 },
        { x1: 8, x2: 9, y1: 22, y2: 39 },
        { x1: 10, x2: 14, y1: 22, y2: 23 },
      ],
      density: {
        animBushSmall: 0.020,
        animBush: 0.010,
      },
      border: 32
    });

    // Deko anhand der Daten setzen
    for (const deko of dekos) {

      let randomDelay = this.getRandomDelay();
      switch (deko.type) {
        case "animBushSmall": this.addChild(new Sprite({
          resource: resources.images[deko.type],
          position: new Vector2(deko.x, deko.y),
          frame: 0,
          hFrames: 3,
          animations: new Animations({
            dekoIdle: new FrameIndexPattern({
              duration: randomDelay,
              frames: [
                {
                  time: 0,
                  frame: 0,
                },
                {
                  time: 120,
                  frame: 1,
                },
                {
                  time: 240,
                  frame: 0,
                },
                {
                  time: 360,
                  frame: 2,
                },
                {
                  time: 480,
                  frame: 0,
                },
              ],
            })
          }),
        })); break;

        case "animBush": this.addChild(new Sprite({
          resource: resources.images[deko.type],
          position: new Vector2(deko.x, deko.y),
          frame: 0,
          hFrames: 6,
          animations: new Animations({
            dekoIdle: new FrameIndexPattern({
              duration: randomDelay,
              frames: [
                {
                  time: 0,
                  frame: 0,
                },
                {
                  time: 120,
                  frame: 1,
                },
                {
                  time: 240,
                  frame: 2,
                },
                {
                  time: 360,
                  frame: 1,
                },
                {
                  time: 480,
                  frame: 0,
                },
                {
                  time: 600,
                  frame: 3,
                },
                {
                  time: 720,
                  frame: 4,
                },
                {
                  time: 840,
                  frame: 3,
                },
                {
                  time: 960,
                  frame: 0,
                },
              ],
            })
          }),
        }));

          break;
        // case STONE: this.addChild(new Stone(res.x, res.y, res.hp)); break;
      }

    }
  }

  getRandomDelay(minSeconds = 4, maxSeconds = 7) {
    const min = minSeconds * 1000; // in ms
    const max = maxSeconds * 1000;
    return Math.random() * (max - min) + min;
  }

  loadStartSea() {
    // sea north part

    // - 1. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(19)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 2. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(20)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 3. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(21)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 4. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(22)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 5. Reihe
    // -- links
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // -- rechts
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(23)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 6. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(24)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(24)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(24)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(24)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(24)), "animWater", 0, 8, 1, new Vector2(16, 16)));


    // sea south part

    // - 1. Reihe
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(25)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 2. Reihe
    // -- links
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // -- rechts
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(26)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 3. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(27)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 4. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(28)), "animWater", 0, 8, 1, new Vector2(16, 16)));

    // - 5. Reihe
    this.addChild(new Deko(new Vector2(gridCells(43), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(44), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(45), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(46), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(47), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(48), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(49), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(50), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(51), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(52), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(53), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(54), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(55), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(56), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(57), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
    this.addChild(new Deko(new Vector2(gridCells(58), gridCells(29)), "animWater", 0, 8, 1, new Vector2(16, 16)));
  }
}
