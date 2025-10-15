import { events, HERO_CHANGE_EQUIPMENT, HERO_PICKS_UP_ITEM } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { gridCells } from "../../helpers/grid.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { InventoryItem } from "../Inventory/Inventory.js";

export const EQUIPMENT_ITEMS = ["sword", "rodPurple", "rodRed", "rodAttackPurple", "rodAttackRed"] as const;
export type EquipmentItem = typeof EQUIPMENT_ITEMS[number];

export interface EquipmentItemData {
    id: number;
    name: EquipmentItem;
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
        name: EquipmentItem;
        amount: number;
        active: boolean;
    }[];

    constructor() {
        super(new Vector2(20, 135));

        this.drawLayer = "HUD";
        this.nextId = 0;

        // Equipment laden
        this.items = SaveGame.loadEquipment().map((item) => ({
            ...item,
            image: resources.images[item.name],
        }));

        // Standard Equipment festlegen beim erstmaligen laden
        if (this.items.length <= 0) {
            this.nextId += 1;
            this.items.push({
                id: this.nextId,
                name: "sword",
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

            const existingItem = this.items.find(item => item.name === imageKey);

            if (!existingItem && EQUIPMENT_ITEMS.includes(imageKey)) {
                // neues Item hinzufügen
                this.nextId += 1;
                this.items.push({
                    id: this.nextId,
                    name: imageKey,
                    amount: 1,
                    active: false,
                });
            }

            // Save inventory in localStorage
            SaveGame.saveEquipment(this.items.map((i) => ({
                id: i.id,
                name: i.name,
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

            // Nächstes Item ermitteln
            const nextIndex = (activeIndex + 1) % this.items.length;

            // Alles deaktivieren
            this.items.forEach(item => item.active = false);

            // Nächstes aktivieren
            this.items[nextIndex]!.active = true;

            // Equipment speichern
            SaveGame.saveEquipment(this.items.map(i => ({
                id: i.id,
                name: i.name,
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
        
        const frameSize = 24; // Bildmaße und um wieviel das nächste Bild nach rechts ausgerichtet werden muss
        const zIndex = 0.01; // damit Item im Vorder-/Hintergrund gezeichnet wird
        const baseY = 0;

        // Draw background of Equipment
        for (let i = 0; i < 10; i++) {
            const baseX = i * frameSize;
            this.addChild(
                new Sprite({
                    resource: resources.images.equipment,
                    position: new Vector2(baseX, baseY - zIndex),
                    frameSize: new Vector2(frameSize, frameSize),
                    hFrames: 25,
                    vFrames: 1,
                    frame: i
                })
            );
        }

        // Draw fresh equipment items
        this.items.forEach((item, index) => {
            const baseX = index * frameSize;

            // Actives Item mit Rahmen kennzeichnen
            if (item.active === true) {

                // show Image for active Item
                let activeFrame = 10 + index;
                if (activeFrame >= 20) {
                    activeFrame = 10;
                }

                this.addChild(
                    new Sprite({
                        resource: resources.images.equipment,
                        position: new Vector2(baseX, baseY),
                        frameSize: new Vector2(frameSize, frameSize),
                        hFrames: 25,
                        vFrames: 1,
                        frame: activeFrame
                    })
                );
            }

            let frame;
            switch (item.name) {
                case "sword":
                    frame = 20;
                    break;
                case "rodPurple":
                    frame = 21;
                    break;
                case "rodRed":
                    frame = 22;
                    break;
                default:
                    frame = 20;
                    break;
            }

            this.addChild(
                new Sprite({
                    resource: resources.images.equipment,
                    position: new Vector2(baseX, baseY + zIndex),
                    frameSize: new Vector2(frameSize, frameSize),
                    hFrames: 25,
                    vFrames: 1,
                    frame: frame
                })
            );
        });
    }

    removeFromEquipment(imageKey: keyof typeof resources.images) {
        this.items = this.items.filter((item) => item.name !== imageKey);
        this.renderEquipment();
    }

    getActiveDamage(): number {
        const activeItem = this.items.find(item => item.active);
        if (!activeItem) return 1; // Standard-Schaden ohne Waffe

        switch (activeItem.name) {
            case "sword": return 1;
            case "rodPurple": return 2;
            case "rodRed": return 5;
            default: return 1;
        }
    }
}