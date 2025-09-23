import { gridCells } from "../helpers/grid.js";
import { resources } from "../Resource.js";
import { Vector2 } from "../Vector2.js";
import { Sprite } from "../Sprite.js";
import { Level } from "../objects/Level/Level.js";
import { Exit } from "../objects/Exit/Exit.js";
import { Hero } from "../objects/Hero/Hero.js";
import { events, HERO_EXITS, CHANGE_LEVEL } from "../Events.js";
import { OutdoorLevel1 } from "./OutdoorLevel1.js";
import { Npc } from "../objects/Npc/Npc.js";
import { Rod } from "../objects/Rod/Rod.js";

export class CaveLevel1 extends Level {

  // declare Stuff
  background: Sprite;
  walls: Set<string>;
  heroStartPosition: Vector2;

  constructor({ position, heroPosition }: {
    position: Vector2;
    heroPosition: Vector2;
  }) {
    super(position);

    console.log(`CaveLevel1 LOADED`, this);

    // Choose Background Image of your Level
    this.background = new Sprite({
      resource: resources.images.cave,
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

    const exit = new Exit(gridCells(5), gridCells(1));
    this.addChild(exit);

    // Create Hero and add to scene
    this.heroStartPosition = heroPosition ?? this.defaultHeroPosition;
    const hero = new Hero(this.heroStartPosition.x, this.heroStartPosition.y);
    this.addChild(hero);

    // Prüfen, ob Item schon im Inventar ist
    if (!this.isInInventory("rodRed")) {
      // erzeuge rod und lege position fest
      const rod = new Rod(gridCells(10), gridCells(6), "rodRed");
      this.addChild(rod);
    }

    const npc1 = new Npc(gridCells(5), gridCells(5), "Ich bin der Uwe und ich bin auch dabei!");
    this.addChild(npc1);

    const npc2 = new Npc(gridCells(10), gridCells(4), "Ich will hier raauuuusss!");
    this.addChild(npc2);

    // Collision Preperation
    const wallDefinitions = {
      right: [],
      left: [],
      top: [],
      bottom: [],
      tree: [],
      stone: [],
      squares: [],
      water: [],
      house: [],
    };

    this.walls = new Set(Object.values(wallDefinitions).flat());
  }

  ready() {
    events.on(HERO_EXITS, this, () => {
      events.emit(
        CHANGE_LEVEL,
        new OutdoorLevel1(
          {
            position: new Vector2(gridCells(0), gridCells(0)),
            heroPosition: new Vector2(gridCells(11), gridCells(3)),
          })
      );
    });
  }
}
