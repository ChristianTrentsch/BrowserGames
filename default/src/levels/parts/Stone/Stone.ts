import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";

export class Stone extends GameObject {

    healthPoints = 4;
    stoneSprite: Sprite;

    constructor(x: number, y: number, hp = 4) {
        super(new Vector2(x, y));

        // this.drawLayer = "FLOOR";
        this.isSolid = true;
        this.healthPoints = hp;

        this.stoneSprite = new Sprite({
            resource: resources.images.outdoorStone,
            frameSize: new Vector2(16, 16),
            position: new Vector2(0, 0),
            hFrames: 4,
            vFrames: 1,
            frame: 0
        })
        this.addChild(this.stoneSprite);
    }

    ready() { }

    step(delta: number) {
        if (this.healthPoints === 3) {
            // Sprite wechseln wenn nur noch 4 HP
            this.removeChild(this.stoneSprite);

            this.stoneSprite = new Sprite({
                resource: resources.images.outdoorStone,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 4,
                vFrames: 1,
                frame: 1 // kaputter Stein
            });
            this.addChild(this.stoneSprite);
        }
        else if (this.healthPoints === 2) {
            // Sprite wechseln wenn nur noch 3 HP
            this.removeChild(this.stoneSprite);

            this.stoneSprite = new Sprite({
                resource: resources.images.outdoorStone,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 4,
                vFrames: 1,
                frame: 2 // kaputter Stein
            });
            this.addChild(this.stoneSprite);
        }
        else if (this.healthPoints === 1) {
            // Sprite wechseln wenn nur noch 1 HP
            this.removeChild(this.stoneSprite);

            this.stoneSprite = new Sprite({
                resource: resources.images.outdoorStone,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 4,
                vFrames: 1,
                frame: 3 // kaputter Stein
            });
            this.addChild(this.stoneSprite);
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
            // string: getRandomText("Stone"),
            string: getNextText("Stone"),
        };
    }
}
