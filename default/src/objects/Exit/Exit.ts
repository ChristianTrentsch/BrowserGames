import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events, HERO_POSTION, HERO_EXITS } from "../../Events.js";

export class Exit extends GameObject {
  constructor(x: number, y: number) {
    super(new Vector2(x, y));

    this.addChild(
      new Sprite({
        resource: resources.images.exit,
        frameSize: new Vector2(16, 16),
        position: new Vector2(0, 0)
      })
    );

    this.drawLayer = "FLOOR";
  }

  ready() {
    events.on(HERO_POSTION, this, (pos) => {
      // detect overlap...
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      if (
        roundedHeroX === this.position.x &&
        roundedHeroY === this.position.y
      ) {
        // Hit the Exit
        events.emit(HERO_EXITS);
      }
    });
  }
}
