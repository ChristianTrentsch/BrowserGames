import { LevelId } from "./helpers/levelRegistry.js";
import { resources } from "./Resource.js";
import { Vector2 } from "./Vector2.js";

export interface InventoryItemData {
    id: number;
    imageKey: keyof typeof resources.images;
}

export class SaveGame {
    private static inventoryKey = "inventory";
    private static heroKey = "heroPosition";
    private static levelKey = "currentLevel";
    private static overlayKey = "overlaySeen";

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
    static isInInventory(imageKey: keyof typeof resources.images): boolean {
        const raw = localStorage.getItem(this.inventoryKey);
        if (!raw) return false;

        try {
            const items: {
                id: number;
                imageKey: keyof typeof resources.images;
            }[] = JSON.parse(raw);

            return items.some(item => item.imageKey === imageKey);
        } catch (err) {
            console.error("Fehler beim Lesen des Inventars:", err);
            return false;
        }
    }

    // --------- HERO POSITION ----------
    static saveHero(levelId: string, pos: Vector2) {
        const data = {
            levelId,
            x: pos.x,
            y: pos.y
        };
        localStorage.setItem(this.heroKey, JSON.stringify(data));
    }

    static loadHero(expectedLevelId: string, defaultPos: Vector2): Vector2 {
        const raw = localStorage.getItem(this.heroKey);
        if (!raw) return defaultPos;

        try {
            const data = JSON.parse(raw) as { levelId: string; x: number; y: number };
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
    static saveLevel(levelId: string) {
        localStorage.setItem(this.levelKey, levelId);
    }

    static loadLevel(): LevelId | null {
        return localStorage.getItem(this.levelKey) as LevelId | null;
    }

    static clearLevel() {
        localStorage.removeItem(this.levelKey);
    }

    // --------- OVERLAY ----------
    static saveOverlay(seen: string) {
        localStorage.setItem(this.overlayKey, seen);
    }

    static loadOverlay() {
        return localStorage.getItem(this.overlayKey);
    }

    static clearOverlay() {
        localStorage.removeItem(this.overlayKey);
    }

    // --------- ALL SAVE DATA ----------
    static clearAll() {
        this.clearOverlay();
        this.clearInventory();
        this.clearHero();
        this.clearLevel();
    }
}
