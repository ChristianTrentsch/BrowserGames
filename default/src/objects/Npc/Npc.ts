import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";

export class Npc extends GameObject {

  textContent: string;

  constructor(x: number, y: number, textContent: string) {
    super(new Vector2(x, y));

    // console.log(`Npc LOADED`, this);

    // npc block path as solid object
    this.isSolid = true;

    // Say individual Text
    this.textContent = textContent;

    // Shadow under feet
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -18),
    });
    this.addChild(shadow);

    // Body of Npc
    const body = new Sprite({
      resource: resources.images.knight,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -19),
      hFrames: 2,
      vFrames: 1,
      frame: 1,
    });
    this.addChild(body);
  }

  getContent() {
    // Maybe expand with story flag logic, etc.
    return {
      portraitFrame: 1, // show first frame of npc sprite
      string: this.textContent,
    };
  }
}
