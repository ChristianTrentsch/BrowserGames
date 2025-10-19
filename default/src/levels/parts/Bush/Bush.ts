import { GameObject } from "../../../GameObject.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";
import { resources } from "../../../Resource.js";
import { getNextText, getRandomText } from "../../../helpers/levelPartsText.js";
import { BUSH, Item } from "../../../objects/Item/Item.js";
import { InventoryUnion } from "../../../objects/Inventory/Inventory.js";
import { events, RES_DESTROY } from "../../../Events.js";
import { getResourceFrame } from "../../../helpers/generateResources.js";

export class Bush extends GameObject {

    healthPoints: number;
    xp: number = 1;
    bushSprite: Sprite;
    type: InventoryUnion = "bush";
    design: "outdoor" | "desert";

    constructor(x: number, y: number, hp = 2, design: "outdoor" | "desert" = "outdoor") {
        super(new Vector2(x, y));

        // this.drawLayer = "FLOOR";
        this.isSolid = true;
        this.healthPoints = hp;
        this.design = design;

        const shadow = new Sprite({
            resource: resources.images.shadow,
            frameSize: new Vector2(32, 32),
            position: new Vector2(-8, -16),
        });
        this.addChild(shadow);

        this.bushSprite = new Sprite({
            resource: resources.images.bush,
            frameSize: new Vector2(16, 16),
            position: new Vector2(0, 0),
            hFrames: 2,
            vFrames: 2,
            frame: getResourceFrame(this.type, this.design),
        })
        this.addChild(this.bushSprite);
    }

    ready() { }

    step(delta: number) {
        
        // bei welchem Image starten wir abhängig vom Type
        let startFrame = getResourceFrame(this.type, this.design);
        
        if (this.healthPoints <= 1) {
            // Sprite wechseln wenn nur noch 1 HP
            this.removeChild(this.bushSprite);

            // +1 um vom startframe die hp zu berücksichtigen
            startFrame += 1;

            this.bushSprite = new Sprite({
                resource: resources.images.bush,
                frameSize: new Vector2(16, 16),
                position: new Vector2(0, 0),
                hFrames: 2,
                vFrames: 2,
                frame: startFrame // kaputter Busch
            });
            this.addChild(this.bushSprite);
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
            BUSH,
            "./sounds/items/pick_up_item.mp3",
            1
        );

        if (this.parent) {
            // füge das Item im übergeordnetem level hinzu
            this.parent.addChild(item);
        }
    }

    getContent() {
        // Maybe expand with story flag logic, etc.
        return {
            portraitFrame: 0, // show first frame of portrait sprite
            // string: getRandomText("Bush"),
            string: getNextText("Bush"),
        };
    }
}
