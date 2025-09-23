import { GameObject } from "../../GameObject.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { resources } from "../../Resource.js";
import { events, HERO_POSTION, HERO_PICKS_UP_ITEM } from "../../Events.js";

export class Rod extends GameObject {

  imageKey: keyof typeof resources.images;
  
  constructor(x: number, y: number, imageKey: keyof typeof resources.images) {
    super(new Vector2(x, y));

    this.imageKey = imageKey;

    const sprite = new Sprite({
      resource: resources.images[imageKey],
      position: new Vector2(0, -5), // nudge upwards visually
    });

    this.addChild(sprite);
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
        // Hit the Item
        this.onCollideWithHero();
      }
    });
  }

  onCollideWithHero() {
    // Remove this instance from the scene
    this.destroy();

    // console.log("ITEM TAKEN");

    // Alert that we picked up a rod
    events.emit(HERO_PICKS_UP_ITEM, {
      imageKey: this.imageKey,
      image: resources.images[this.imageKey],
      position: this.position,
    });
  }
}
