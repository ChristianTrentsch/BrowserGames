import { gridCells, TILE_SIZE } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Exit } from "../objects/Exit/Exit.js";
import { Hero } from "../objects/Hero/Hero.js";
import { Rod } from "../objects/Rod/Rod.js";
import { events, HERO_EXITS, CHANGE_LEVEL } from "../Events.js";
import { CaveLevel1 } from "./CaveLevel1.js";
import { SaveGame } from "../SaveGame.js";
import { LevelId } from "../helpers/levelRegistry.js";

export class OutdoorLevel1 extends Level {

  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;
  defaultHeroPosition = new Vector2(gridCells(8), gridCells(4));
  levelId: LevelId = "OutdoorLevel1";   // eindeutige ID

  constructor({ position, heroPosition }: {
    position: Vector2;
    heroPosition?: Vector2;
  }) {
    // Ohne Sound
    // super(position);
    
    // mit Sound
    super(position, "./sounds/levels/OutdoorLevel1.mp3", 0.4);
    
    // Initialisierung des Sounds (abhängig vom SaveGame)
    this.initBackgroundSound();

    console.log(`OutdoorLevel1 LOADED`, this);

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.sky,
      frameSize: new Vector2(320, 180),
      position: new Vector2(0, 0)
    });

    // Choose actual Level Ground
    const groundSprite = new Sprite({
      resource: resources.images.ground,
      frameSize: new Vector2(320, 180),
      position: new Vector2(0, 0)
    });
    this.addChild(groundSprite);

    const exit = new Exit(gridCells(10), gridCells(3));
    this.addChild(exit);

    //** --- Create Hero and add to scene --- */
    // entweder geladene Position (Reload) oder die übergebene Startposition (Levelwechsel)
    this.heroStartPosition = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    //** --- Prüfen, ob Item schon im Inventar ist, ansonsten erzeugen --- */
    if (!SaveGame.isInInventory("rodPurple")) {
      // erzeuge Item und lege position fest
      const rod = new Rod(gridCells(7), gridCells(6), "rodPurple", "./sounds/items/item_01.mp3");
      this.addChild(rod);
    }

    // Collision Preperation
    const wallDefinitions = {
      right: this.generateWall(new Vector2(256, 32), new Vector2(256, 96), TILE_SIZE, "right"),
      left: this.generateWall(new Vector2(32, 32), new Vector2(32, 96), TILE_SIZE, "left"),
      top: this.generateWall(new Vector2(48, 16), new Vector2(240, 16), TILE_SIZE, "top"),
      bottom: this.generateWall(new Vector2(48, 112), new Vector2(240, 112), TILE_SIZE, "bottom"),
      tree: ["64,48", "208,64", "224,32"],
      stone: ["192,96", "208,96", "224,96"],
      squares: ["64,64", "64,80", "80,64", "80,80", "128,48", "144,48"],
      water: ["112,80", "128,80", "144,80", "160,80"],
      house: ["224,64"],
      nothing: ["240,32", "96,32", "80,32", "64,32", "48,32",],
    };

    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {

      // Alten Level-Sound stoppen
      this.stopBackgroundSound();

      events.emit(
        CHANGE_LEVEL,
        new CaveLevel1({
          position: new Vector2(gridCells(0), gridCells(0)),
          heroPosition: new Vector2(gridCells(6), gridCells(1)), // feste Startposition
        })
      );
    });
  }
}
