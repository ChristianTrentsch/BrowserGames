import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";
import { Item, STONE } from "../../../objects/Item/Item.js";
import { InventoryUnion } from "../../../objects/Inventory/Inventory.js";
import { events, RES_DESTROY } from "../../../Events.js";
import { getResourceFrame } from "../../../helpers/generateResources.js";

export class Stone extends GameObject {

    healthPoints: number;
    xp: number = 3;
    stoneSprite: Sprite;
    type: InventoryUnion = "stone";
    design: "outdoor" | "desert";

    constructor(x: number, y: number, hp = 4, design: "outdoor" | "desert" = "outdoor") {
        super(new Vector2(x, y));

        // this.drawLayer = "FLOOR";
        this.isSolid = true;
        this.healthPoints = hp;
        this.design = design;

        this.stoneSprite = new Sprite({
            resource: resources.images.stone,
            frameSize: new Vector2(16, 16),
            position: new Vector2(0, 0),
            hFrames: 4,
            vFrames: 2,
            frame: getResourceFrame(this.type, this.design),
        })
        this.addChild(this.stoneSprite);
    }

    ready() { }

    step(delta: number) {

        // bei welchem Image starten wir abhängig vom Type
        let startFrame = getResourceFrame(this.type, this.design);

        // Stein-Sprite basierend auf HP wechseln
        const frame = startFrame + (4 - this.healthPoints); // 0 = intakt, 3 = schwer beschädigt
        
        if (this.healthPoints >= 1 && this.healthPoints <= 3) {
            this.removeChild(this.stoneSprite);
            this.stoneSprite = new Sprite({
                resource: resources.images.stone,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 4,
                vFrames: 2,
                frame: frame
            });
            this.addChild(this.stoneSprite);
        }

        if (this.healthPoints <= 0) {

            // Resource wurde zerstört
            events.emit(RES_DESTROY, this);

            // vom Spieler zerstört
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
            STONE,
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
