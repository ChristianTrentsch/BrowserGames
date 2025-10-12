import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";
import { Item } from "../../../objects/Item/Item.js";

export class Stone extends GameObject {

    healthPoints: number;
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
        // Stein-Sprite basierend auf HP wechseln
        const frame = 4 - this.healthPoints; // 0 = intakt, 3 = schwer beschädigt
        if (frame >= 1 && frame <= 3) {
            this.removeChild(this.stoneSprite);
            this.stoneSprite = new Sprite({
                resource: resources.images.outdoorStone,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 4,
                vFrames: 1,
                frame: frame
            });
            this.addChild(this.stoneSprite);
        }

        if (this.healthPoints <= 0) {
            this.destroy(true);
        }
    }

    destroy(killedByHero = false) {
        if (killedByHero) {
            this.spawnItem();
        }
        // Cleanup
        super.destroy();
    }

    spawnItem() {
        const item = new Item(
            this.position.x,
            this.position.y,
            "stoneRessource",
            "./sounds/items/pick_up_item.mp3",
            1
        );

        if (this.parent) {
            // füge das Item dem level hinzu
            this.parent.addChild(item);
        }
    }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 0, // show first frame of portrait sprite
            // string: getRandomText("Stone"),
            string: getNextText("Stone"),
        };
    }
}
