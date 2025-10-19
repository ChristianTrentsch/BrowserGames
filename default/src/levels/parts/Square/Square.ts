import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";
import { getResourceFrame } from "../../../helpers/generateResources.js";

export class Square extends GameObject {

    type = "square";
    design: "outdoor" | "desert";

    constructor(x: number, y: number, design: "outdoor" | "desert" = "outdoor") {
        super(new Vector2(x, y));

        this.design = design;

        const tree = new Sprite({
            resource: resources.images.square,
            position: new Vector2(0, 0),
            frameSize: new Vector2(16, 16),
            hFrames: 1,
            vFrames: 2,
            frame: getResourceFrame(this.type, this.design),
        })
        this.addChild(tree);

        this.isSolid = true;
        this.drawLayer = "FLOOR";
    }

    ready() { }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 0, // show first frame of portrait sprite
            // string: getRandomText("Square"),
            string: getNextText("Square"),
        };
    }
}
