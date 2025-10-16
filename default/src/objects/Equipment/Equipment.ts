import { EventCollectible, events, HERO_CHANGE_EQUIPMENT, HERO_PICKS_UP_ITEM } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";

export const EQUIPMENT_SWORD = "sword";
export const EQUIPMENT_ROD_PURPLE = "rodPurple";
export const EQUIPMENT_ROD_RED = "rodRed";
export const EQUIPMENT_ITEMS = [EQUIPMENT_SWORD, EQUIPMENT_ROD_PURPLE, EQUIPMENT_ROD_RED] as const;
export type EquipmentUnion = typeof EQUIPMENT_ITEMS[number];

export interface EquipmentItemData {
    id: number;
    name: EquipmentUnion;
    amount: number;
    active: boolean;
}

export class Equipment extends GameObject {

    nextId: number;
    items: {
        id: number;
        name: EquipmentUnion;
        amount: number;
        active: boolean;
    }[];

    constructor() {
        super(new Vector2(20, 135));

        this.drawLayer = "HUD";
        this.nextId = 0;

        // Equipment laden
        this.items = SaveGame.loadEquipment();

        // nextId auf höchsten ID-Wert setzen
        this.nextId = Math.max(0, ...this.items.map(item => item.id));

        // Draw initial state on bootup
        this.renderEquipment();
    }

    ready() {
        //** --- Add Equipment --- */ 
        events.on(HERO_PICKS_UP_ITEM, this, (data: { name: EquipmentUnion }) => {
            const { name } = data;

            const existingItem = this.items.find(item => item.name === name);
            if (!existingItem && EQUIPMENT_ITEMS.includes(name)) {

                // Alles deaktivieren
                this.items.forEach(item => item.active = false);

                // neues Item eingesammelt, dann automatisch auf aktiv setzen
                this.nextId += 1;
                this.items.push({
                    id: this.nextId,
                    name: name,
                    amount: 1,
                    active: true,
                });
            }

            SaveGame.saveEquipment(this.items.map((i) => ({
                id: i.id,
                name: i.name,
                amount: i.amount,
                active: i.active,
            })));

            this.renderEquipment();
        });

        //** --- Change Equipment --- */ 
        events.on(HERO_CHANGE_EQUIPMENT, this, () => {

            // Aktuell aktives Item finden
            const activeIndex = this.items.findIndex(item => item.active === true);

            // Nächstes Item ermitteln
            const nextIndex = (activeIndex + 1) % this.items.length;

            // Alles deaktivieren
            this.items.forEach(item => item.active = false);

            // Nächstes aktivieren
            this.items[nextIndex]!.active = true;

            SaveGame.saveEquipment(this.items.map(i => ({
                id: i.id,
                name: i.name,
                amount: i.amount,
                active: i.active,
            })));

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
                case EQUIPMENT_SWORD:
                    frame = 20;
                    break;
                case EQUIPMENT_ROD_PURPLE:
                    frame = 21;
                    break;
                case EQUIPMENT_ROD_RED:
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
            case EQUIPMENT_SWORD: return 1;
            case EQUIPMENT_ROD_PURPLE: return 2;
            case EQUIPMENT_ROD_RED: return 5;
            default: return 1;
        }
    }
}