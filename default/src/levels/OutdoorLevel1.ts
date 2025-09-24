import { gridCells } from "../helpers/grid.js";
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

export class OutdoorLevel1 extends Level {

  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;

  levelId = "OutdoorLevel1";   // eindeutige ID
  defaultHeroPosition = new Vector2(gridCells(11), gridCells(3));

  constructor({ position, heroPosition }: {
    position: Vector2;
    heroPosition?: Vector2;
  }) {
    super(position);

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

    // Create Hero and add to scene
    // this.heroStartPosition = heroPosition ?? this.defaultHeroPosition;

    // entweder geladene Position (Reload) oder die übergebene Startposition (Levelwechsel)
    this.heroStartPosition = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    // Prüfen, ob Item schon im Inventar ist
    if (!SaveGame.isInInventory("rodPurple")) {
      // erzeuge rod und lege position fest
      const rod = new Rod(gridCells(7), gridCells(6), "rodPurple");
      this.addChild(rod);
    }

    // Collision Preperation
    const wallDefinitions = {
      right: ["240,32", "256,48", "256,64", "256,80", "256,96"],
      left: ["32,48", "32,64", "32,80", "32,96"],
      top: [
        "48,32",
        "64,32",
        "80,32",
        "96,32",
        "112,16",
        "128,16",
        "144,16",
        "160,16",
        "176,16",
        "192,16",
        "208,16",
        "224,16",
      ],
      bottom: [
        "48,112",
        "64,112",
        "80,112",
        "96,112",
        "112,112",
        "128,112",
        "144,112",
        "160,112",
        "176,112",
        "192,112",
        "208,112",
        "224,112",
        "240,112",
      ],
      tree: ["64,48", "208,64", "224,32"],
      stone: ["192,96", "208,96", "224,96"],
      squares: ["64,64", "64,80", "80,64", "80,80", "128,48", "144,48"],
      water: ["112,80", "128,80", "144,80", "160,80"],
      house: ["224,64"],
    };

    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {
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
