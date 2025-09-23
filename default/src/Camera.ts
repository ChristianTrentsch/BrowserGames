import { GameObject } from "./GameObject.js";
import { events, HERO_POSTION, CHANGE_LEVEL } from "./Events.js";
import { Vector2 } from "./Vector2.js";

export class Camera extends GameObject {
  constructor(position: Vector2) {
    super(position);

    events.on(HERO_POSTION, this, (heroPosition: Vector2) => {
      // Create a new position based on the heros's position
      this.centerPositionOnTarget(heroPosition);

      // console.log("Hero position is now:", heroPosition);
    });

    // Camera knows when a new level starts
    events.on(CHANGE_LEVEL, this, (newMap) => {
      this.centerPositionOnTarget(newMap.heroStartPosition);
    });
  }

  centerPositionOnTarget(pos: Vector2) {
    const personHalf = 8;
    const canvasWidth = 320;
    const canvasHeight = 180;
    const halfWidth = -personHalf + canvasWidth / 2;
    const halfHeight = -personHalf + canvasHeight / 2;

    this.position = new Vector2(-pos.x + halfWidth, -pos.y + halfHeight);
  }
}
