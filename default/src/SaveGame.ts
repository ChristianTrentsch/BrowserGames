import { LevelId } from "./helpers/levelRegistry.js";
import { InventoryItem, InventoryItemData } from "./objects/Inventory/Inventory.js";
import { Vector2 } from "./Vector2.js";

export type OverlayType = "true" | "false";
export type SoundType = "on" | "off";
export type InputType = "keyboard" | "controller";
export type ResourceType = "Tree" | "Stone" | "Bush";

export interface ResourceSaveData {
    type: ResourceType;
    x: number;
    y: number;
    hp: number;
}

export class SaveGame {
    private static inventoryKey = "inventory";
    private static heroKey = "heroPosition";
    private static levelKey = "currentLevel";
    private static overlayKey = "overlaySeen";
    private static soundKey = "sound";
    private static inputKey = "input";

    private static ressourceKey = "ressources";

    // --------- INVENTORY ----------
    static saveInventory(items: InventoryItemData[]) {
        localStorage.setItem(this.inventoryKey, JSON.stringify(items));
    }

    static loadInventory(): InventoryItemData[] {
        const raw = localStorage.getItem(this.inventoryKey);
        if (!raw) return [];
        try {
            return JSON.parse(raw) as InventoryItemData[];
        } catch {
            return [];
        }
    }

    static clearInventory() {
        localStorage.removeItem(this.inventoryKey);
    }

    // Prüft, ob ein Item mit dem angegebenen imageKey bereits im Inventar vorhanden ist
    static isInInventory(imageKey: InventoryItem): boolean {
        const raw = localStorage.getItem(this.inventoryKey);
        if (!raw) return false;

        try {
            const items = JSON.parse(raw) as InventoryItemData[];

            return items.some(item => item.imageKey === imageKey);
        } catch (err) {
            console.error("Fehler beim Lesen des Inventars:", err);
            return false;
        }
    }

    // --------- HERO POSITION ----------
    static saveHero(levelId: LevelId, pos: Vector2) {
        const data = {
            levelId,
            x: pos.x,
            y: pos.y
        };
        localStorage.setItem(this.heroKey, JSON.stringify(data));
    }

    static loadHero(expectedLevelId: LevelId, defaultPos: Vector2): Vector2 {
        const raw = localStorage.getItem(this.heroKey);
        if (!raw) return defaultPos;

        try {
            const data = JSON.parse(raw) as { levelId: LevelId; x: number; y: number };
            if (data.levelId === expectedLevelId) {
                return new Vector2(data.x, data.y);
            }
        } catch (e) {
            console.warn("Fehler beim Laden der Hero Position:", e);
        }
        return defaultPos;
    }

    static clearHero() {
        localStorage.removeItem(this.heroKey);
    }

    // --------- LEVEL ----------
    static saveLevel(levelId: LevelId) {
        localStorage.setItem(this.levelKey, levelId);
    }

    static loadLevel(): LevelId | null {
        return localStorage.getItem(this.levelKey) as LevelId | null;
    }

    static clearLevel() {
        localStorage.removeItem(this.levelKey);
    }

    // --------- OVERLAY ----------
    static saveOverlay(seen: OverlayType) {
        localStorage.setItem(this.overlayKey, seen);
    }

    static loadOverlay() {
        return localStorage.getItem(this.overlayKey) as OverlayType;
    }

    static clearOverlay() {
        localStorage.removeItem(this.overlayKey);
    }

    // --------- SOUND ----------
    static saveSound(status: SoundType) {
        localStorage.setItem(this.soundKey, status);
    }

    static loadSound() {
        return localStorage.getItem(this.soundKey) as SoundType;
    }

    static clearSound() {
        localStorage.removeItem(this.soundKey);
    }

    // --------- INPUT ----------
    static saveInput(status: InputType) {
        localStorage.setItem(this.inputKey, status);
    }

    static loadInput() {
        return localStorage.getItem(this.inputKey) as InputType;
    }

    static clearInput() {
        localStorage.removeItem(this.inputKey);
    }

    // --------- RESOURCES ----------
    static saveResources(levelId: LevelId, ressources: ResourceSaveData[]) {
        const raw = localStorage.getItem(this.ressourceKey);
        let all: Partial<Record<LevelId, ResourceSaveData[]>> = {};

        if (raw) {
            try {
                all = JSON.parse(raw);
            } catch (e) {
                console.warn("Fehler beim Parsen der Ressourcen:", e);
            }
        }

        all[levelId] = ressources; // immer setzen

        localStorage.setItem(this.ressourceKey, JSON.stringify(all));
    }


    static loadResources(levelId: LevelId): ResourceSaveData[] {
        const raw = localStorage.getItem(this.ressourceKey);
        if (!raw) return [];
        try {
            const all = JSON.parse(raw) as Record<LevelId, ResourceSaveData[]>;
            return all[levelId] ?? []; // zum level passende ressource zurück geben
        } catch (e) {
            console.warn("Fehler beim Laden der Ressourcen:", e);
            return [];
        }
    }

    static clearResources() {
        localStorage.removeItem(this.ressourceKey);
    }

    // --------- ALL SAVE DATA ----------
    static clearAll() {
        this.clearInventory();
        this.clearHero();
        this.clearOverlay();
        this.clearSound();
        this.clearLevel();
        this.clearInput();
        this.clearResources();
    }

    static initAll() {
        this.saveSound("on");
        this.saveLevel("OutdoorLevel1");
        // this.saveLevel("StartLevel");
        this.saveOverlay("false");
        this.saveInput("keyboard");
        this.saveResources("OutdoorLevel1", []);
    }
}
