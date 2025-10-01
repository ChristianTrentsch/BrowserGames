import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";

export class Tree extends GameObject {

    healthPoints = 4;
    treeSprite: Sprite;

    constructor(x: number, y: number) {
        super(new Vector2(x, y));

        const shadow = new Sprite({
            resource: resources.images.shadow,
            frameSize: new Vector2(32, 32),
            position: new Vector2(-8, -16),
        });
        this.addChild(shadow);

        this.treeSprite = new Sprite({
            resource: resources.images.outdoorTree,
            frameSize: new Vector2(16, 32),
            position: new Vector2(0, -15),
            hFrames: 4,
            vFrames: 1,
            frame: 0 // intakter Baum
        })
        this.addChild(this.treeSprite);

        this.isSolid = true;
        // this.drawLayer = "FLOOR";

    }

    ready() { }

    step(delta: number) {
        if (this.healthPoints === 3) {
            // Sprite wechseln wenn nur noch 3 HP
            this.removeChild(this.treeSprite);

            this.treeSprite = new Sprite({
                resource: resources.images.outdoorTree,
                frameSize: new Vector2(16, 32),
                position: new Vector2(0, -15),
                hFrames: 4,
                vFrames: 1,
                frame: 1 // leicht beschädigter Baum
            });
            this.addChild(this.treeSprite);
        }
        else if (this.healthPoints === 2) {
            // Sprite wechseln wenn nur noch 2 HP
            this.removeChild(this.treeSprite);

            this.treeSprite = new Sprite({
                resource: resources.images.outdoorTree,
                frameSize: new Vector2(16, 32),
                position: new Vector2(0, -15),
                hFrames: 4,
                vFrames: 1,
                frame: 2 // beschädigter Baum
            });
            this.addChild(this.treeSprite);
        }
        else if (this.healthPoints === 1) {
            // Sprite wechseln wenn nur noch 1 HP
            this.removeChild(this.treeSprite);

            this.treeSprite = new Sprite({
                resource: resources.images.outdoorTree,
                frameSize: new Vector2(16, 32),
                position: new Vector2(0, -15),
                hFrames: 4,
                vFrames: 1,
                frame: 3 // kaputter Baum
            });
            this.addChild(this.treeSprite);
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
            // string: getRandomText("Tree"),
            string: getNextText("Tree"),
        };
    }
}
