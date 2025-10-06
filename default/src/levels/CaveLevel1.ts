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
    // Ohne Sound
    // super(position);

    // mit Sound
    super(position, "./sounds/levels/CaveLevel1.mp3", 0.3);

    // Initialisierung des Sounds (abhängig vom SaveGame)
    this.initBackgroundSound();

    // console.log(`CaveLevel1 LOADED`, this);

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

    // change level gameobject
    const exit = new Exit(gridCells(5), gridCells(1));
    this.addChild(exit);

    //** --- Create Hero and add to scene --- */
    // entweder geladene Position (Reload) oder die übergebene Startposition (Levelwechsel)
    this.heroStartPosition = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    //** --- Prüfen, ob Item schon im Inventar ist, ansonsten erzeugen --- */
    if (!SaveGame.isInInventory("rodRed")) {
      // erzeuge Item und lege position fest
      const rodRed = new Item(gridCells(10), gridCells(6), "rodRed");
      this.addChild(rodRed);
    }

    //** --- Create Npc and add to scene --- */
    const npc1 = new Npc(gridCells(5), gridCells(5), "Ich bin der Uwe und ich bin auch dabei!");
    this.addChild(npc1);
    const npc2 = new Npc(gridCells(10), gridCells(4), "Ich will hier raauuuusss!");
    this.addChild(npc2);

    // Collision Preperation
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

      // Alten Level-Sound stoppen
      this.stopBackgroundSound();

      events.emit(
        CHANGE_LEVEL,
        new OutdoorLevel1(
          {
            position: new Vector2(gridCells(0), gridCells(0)),
            heroPosition: new Vector2(gridCells(11), gridCells(3)), // feste Startposition
          })
      );
    });
  }
}
