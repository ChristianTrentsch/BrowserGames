import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";

export class Lamp extends GameObject {

    constructor(x: number, y: number) {
        super(new Vector2(x, y));

        this.isSolid = true;

        this.addChild(new Sprite({
            resource: resources.images.deko16x32,
            frameSize: new Vector2(16, 32),
            position: new Vector2(0, -16),
            hFrames: 4,
            frame: 0,
        }));
    }

    ready() { }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 0, // show first frame of portrait sprite
            // string: getRandomText("House"),
            string: getNextText("Lamp"),
        };
    }
}
