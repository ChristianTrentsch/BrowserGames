import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";

export class Stone extends GameObject {

    textContent: string = "Ich bin ein Stein!";

    constructor(x: number, y: number) {
        super(new Vector2(x, y));

        const tree = new Sprite({
            resource: resources.images.outdoorStone,
            frameSize: new Vector2(16, 16),
            position: new Vector2(0, 0),
        })
        this.addChild(tree);

        this.isSolid = true;
        // this.drawLayer = "FLOOR";
    }

    ready() { }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 1, // show first frame of npc sprite
            string: this.textContent,
        };
    }
}
