import { gridCells } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Exit } from "../objects/Exit/Exit.js";
import { Hero } from "../objects/Hero/Hero.js";
import { Rod } from "../objects/Rod/Rod.js";
import { events } from "../Events.js";
import { OutdoorLevel1 } from "./OutdoorLevel1.js";

export class CaveLevel1 extends Level {
  constructor(params = {}) {
    super({});

    this.walls = new Set();

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.cave,
      frameSize: new Vector2(320, 180),
    });

    // Choose actual Level Ground
    const groundSprite = new Sprite({
      resource: resources.images.caveGround,
      frameSize: new Vector2(320, 180),
    });
    this.addChild(groundSprite);

    // 1. links/rechts
    // 2. - oben/ + unten
    // gridCells(10), gridCells(3)

    const exit = new Exit(gridCells(5), gridCells(1));
    this.addChild(exit);

    // Create Hero and add to scene
    const heroStartPosition = params.heroPosition ?? this.defaultHeroPosition;
    const hero = new Hero(heroStartPosition.x, heroStartPosition.y);
    this.addChild(hero);

    /* ADD ITEMS TO SCENE */
    const rod = new Rod(gridCells(9), gridCells(6));
    this.addChild(rod);

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

    // this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(events.HERO_EXITS, this, () => {
      console.log("CaveLevel1: ", events.HERO_EXITS);

      events.emit(events.CHANGE_LEVEL, new OutdoorLevel1({
        heroPosition: new Vector2(gridCells(11), gridCells(3)),
      }));
    });
  }
}
