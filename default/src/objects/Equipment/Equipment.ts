import { events, HERO_CHANGE_EQUIPMENT, HERO_PICKS_UP_ITEM } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { InventoryItem } from "../Inventory/Inventory.js";

export const EQUIPMENT_ITEMS = ["sword", "rodPurple", "rodRed"] as const;
export type EquipmentItem = typeof EQUIPMENT_ITEMS[number];

export interface EquipmentItemData {
    id: number;
    imageKey: EquipmentItem;
    amount: number;
    active: boolean;
}

export interface EquipmentEvent {
    imageKey: EquipmentItem
    position: Vector2
    image: ResourceImageOptions
    itemSound: HTMLAudioElement
}

export class Equipment extends GameObject {

    nextId: number;
    items: {
        id: number;
        image: ResourceImageOptions;
        imageKey: EquipmentItem;
        amount: number;
        active: boolean;
    }[];

    constructor() {
        super(new Vector2(1, 153));

        this.drawLayer = "HUD";
        this.nextId = 0;

        // Equipment laden
        this.items = SaveGame.loadEquipment().map((item) => ({
            ...item,
            image: resources.images[item.imageKey],
        }));

        // Standard Equipment festlegen beim erstmaligen laden
        if (this.items.length <= 0) {
            this.nextId += 1;
            this.items.push({
                id: this.nextId,
                image: resources.images["sword"],
                imageKey: "sword",
                amount: 1,
                active: true
            });
        }

        // nextId auf höchsten ID-Wert setzen
        this.nextId = Math.max(0, ...this.items.map(item => item.id));

        // Draw initial state on bootup
        this.renderEquipment();
    }

    ready() {
        //** --- Event Equipment add item --- */ 
        events.on(HERO_PICKS_UP_ITEM, this, (data: { imageKey: EquipmentItem }) => {
            const { imageKey } = data;

            const existingItem = this.items.find(item => item.imageKey === imageKey);

            if (!existingItem && EQUIPMENT_ITEMS.includes(imageKey)) {
                // neues Item hinzufügen
                this.nextId += 1;
                this.items.push({
                    id: this.nextId,
                    image: resources.images[imageKey],
                    imageKey: imageKey,
                    amount: 1,
                    active: false,
                });
            }

            // Save inventory in localStorage
            SaveGame.saveEquipment(this.items.map((i) => ({
                id: i.id,
                imageKey: i.imageKey,
                amount: i.amount,
                active: i.active,
            })));

            // Draw initial state
            this.renderEquipment();
        });

        //** --- Change Equipment to active --- */ 
        events.on(HERO_CHANGE_EQUIPMENT, this, () => {

            // Aktuell aktives Item finden
            const activeIndex = this.items.findIndex(item => item.active === true);

            // Nächstes Item ermitteln falls vorhanden
            const nextIndex = (activeIndex + 1) % this.items.length;

            // Alles deaktivieren
            this.items.forEach(item => item.active = false);

            // Nächstes aktivieren
            this.items[nextIndex]!.active = true;

            // Equipment speichern
            SaveGame.saveEquipment(this.items.map(i => ({
                id: i.id,
                imageKey: i.imageKey,
                amount: i.amount,
                active: i.active,
            })));

            // Neu rendern
            this.renderEquipment();
        })
    }


    renderEquipment() {
        // Remove old drawings
        this.children.forEach((child) => child.destroy());

        // Draw fresh equipment items
        this.items.forEach((item, index) => {

            const baseX = index * 25;
            const baseY = 0;

            // Item Background zeichnen
            let background = new Sprite({
                resource: resources.images.equipmentItemFrame,
                position: new Vector2(baseX, baseY),
                frameSize: new Vector2(24, 24),
            });

            if (item.active === true) {
                background = new Sprite({
                    resource: resources.images.equipmentActiveFrame,
                    position: new Vector2(baseX, baseY),
                    frameSize: new Vector2(24, 24),
                });
            }

            this.addChild(background);

            // Item zeichnen
            let sprite = new Sprite({
                resource: resources.images[item.imageKey],
                position: new Vector2(baseX + 4, baseY + 4),
            });

            // falls item sword ist richtiges image wählen
            if (item.imageKey === "sword") {
                sprite = new Sprite({
                    resource: resources.images[item.imageKey],
                    position: new Vector2(baseX - 2, baseY + 2),
                    frameSize: new Vector2(32, 32),
                    hFrames: 6,
                    vFrames: 4,
                    frame: 18,
                });
            }

            this.addChild(sprite);

        });

    }

    removeFromEquipment(imageKey: keyof typeof resources.images) {
        this.items = this.items.filter((item) => item.imageKey !== imageKey);
        this.renderEquipment();
    }
}