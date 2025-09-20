import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events } from "../../Events.js";

export class Exit extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y),
    });

    this.addChild(
      new Sprite({
        resource: resources.images.exit,
      })
    );
  }

  ready() {
    events.on(events.HERO_POSTION, this, (pos) => {
      // detect overlap...
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      if (
        roundedHeroX === this.position.x &&
        roundedHeroY === this.position.y
      ) {
        // Hit the Exit
        console.log("Exit: ", events.HERO_POSTION, pos);

        events.emit(events.HERO_EXITS);
      }
    });
  }
}
