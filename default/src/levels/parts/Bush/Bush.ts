import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";

export class Bush extends GameObject {

    healthPoints = 2;
    bushSprite: Sprite;

    constructor(x: number, y: number, hp = 2) {
        super(new Vector2(x, y));

        // this.drawLayer = "FLOOR";
        this.isSolid = true;
        this.healthPoints = hp;

        const shadow = new Sprite({
            resource: resources.images.shadow,
            frameSize: new Vector2(32, 32),
            position: new Vector2(-8, -16),
        });
        this.addChild(shadow);

        this.bushSprite = new Sprite({
            resource: resources.images.outdoorBush,
            frameSize: new Vector2(16, 16),
            position: new Vector2(0, 0),
            hFrames: 2,
            vFrames: 1,
            frame: 0
        })
        this.addChild(this.bushSprite);
    }

    ready() { }

    step(delta: number) {
        if (this.healthPoints === 1) {
            // Sprite wechseln wenn nur noch 1 HP
            this.removeChild(this.bushSprite);

            this.bushSprite = new Sprite({
                resource: resources.images.outdoorBush,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 2,
                vFrames: 1,
                frame: 1 // kaputter Busch
            });
            this.addChild(this.bushSprite);
        }

        if (this.healthPoints <= 0) {
            this.destroy();
        }
    }

    destroy() {
        // Cleanup
        super.destroy();
    }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 1, // show first frame of npc sprite
            // string: getRandomText("Bush"),
            string: getNextText("Bush"),
        };
    }
}
