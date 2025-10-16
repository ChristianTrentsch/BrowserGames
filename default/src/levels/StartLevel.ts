import { gridCells, TILE_SIZE } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Hero } from "../objects/Hero/Hero.js";
import { SaveGame } from "../SaveGame.js";
import { LevelId } from "../helpers/levelRegistry.js";
import { Bush } from "./parts/Bush/Bush.js";
import { House } from "./parts/House/House.js";
import { Nothing } from "./parts/Nothing/Nothing.js";
import { Square } from "./parts/Square/Square.js";
import { Stone } from "./parts/Stone/Stone.js";
import { Swamp } from "./parts/Swamp/Swamp.js";
import { Tree } from "./parts/Tree/Tree.js";
import { Water } from "./parts/Water/Water.js";

export class StartLevel extends Level {

  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;
  defaultHeroPosition = new Vector2(gridCells(8), gridCells(8));
  levelId: LevelId = "StartLevel";   // eindeutige ID

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

    console.log(`StartLevel LOADED`, this);

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.outdoorSky,
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


    this.addChild(new Tree(gridCells(1), gridCells(3)));

    this.addChild(new Bush(gridCells(2), gridCells(3)));

    this.addChild(new House(gridCells(4), gridCells(3)));

    this.addChild(new Square(gridCells(6), gridCells(3)));

    this.addChild(new Stone(gridCells(8), gridCells(3)));

    this.addChild(new Swamp(gridCells(10), gridCells(3)));

    this.addChild(new Water(gridCells(12), gridCells(3)));

    this.addChild(new Nothing(gridCells(14), gridCells(3)));

    //** --- Create Hero and add to scene --- */
    // entweder geladene Position (Reload) oder die übergebene Startposition (Levelwechsel)
    this.heroStartPosition = SaveGame.loadHero(this.levelId, heroPosition ?? this.defaultHeroPosition);
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    // Collision Preperation
    const wallDefinitions = {
      right: this.generateWall(new Vector2(320, 16), new Vector2(320, 144), TILE_SIZE, "right"),
      left: this.generateWall(new Vector2(-16, 16), new Vector2(-16, 144), TILE_SIZE, "left"),
      top: this.generateWall(new Vector2(0, 0), new Vector2(304, 0), TILE_SIZE, "top"),
      bottom: this.generateWall(new Vector2(0, 160), new Vector2(304, 160), TILE_SIZE, "bottom"),
    };

    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() { }
}
