import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";
import { Item } from "../../../objects/Item/Item.js";

export class Tree extends GameObject {

    healthPoints: number;
    treeSprite: Sprite;

    constructor(x: number, y: number, hp = 4) {
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

        this.treeSprite = new Sprite({
            resource: resources.images.outdoorTree,
            frameSize: new Vector2(16, 32),
            position: new Vector2(0, -15),
            hFrames: 4,
            vFrames: 1,
            frame: 0 // intakter Baum
        })
        this.addChild(this.treeSprite);
    }

    ready() { }

    step(delta: number) {
        // Baum-Sprite basierend auf HP wechseln
        const frame = 4 - this.healthPoints; // 0 = intakt, 3 = schwer beschädigt
        if (frame >= 1 && frame <= 3) {
            this.removeChild(this.treeSprite);
            this.treeSprite = new Sprite({
                resource: resources.images.outdoorTree,
                frameSize: new Vector2(16, 32),
                position: new Vector2(0, -15),
                hFrames: 4,
                vFrames: 1,
                frame: frame
            });
            this.addChild(this.treeSprite);
        }

        if (this.healthPoints <= 0) {
            this.destroy(true); // Baum vom Spieler zerstört
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
            "treeRessource",
            "./sounds/items/pick_up_item.mp3",
            1
        );

        if (this.parent) {
            // füge das Item im übergeordnetem level hinzu
            this.parent.addChild(item);
        }


        // const drops = ["treeRessource", "apple", null]; // null = keine Dropp
        // const drop = drops[Math.floor(Math.random() * drops.length)];
        // if (!drop) return;

        // const item = new Item(this.x, this.y, drop);
        // this.parent?.addChild(item);
    }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 0, // show first frame of portrait sprite
            // string: getRandomText("Tree"),
            string: getNextText("Tree"),
        };
    }
}
