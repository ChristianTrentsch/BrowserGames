import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { gridCells } from "../../helpers/grid.js";
import { inventoryStorageKey } from "../Inventory/Inventory.js";

/**
 * Base Level class.
 * Make it abstract and force subclasses to provide a `background: Sprite`.
 */
export abstract class Level extends GameObject {
  // Subclasses MUST provide a Sprite for the background
  abstract background: Sprite;
  abstract walls: Set<string>;

  defaultHeroPosition: Vector2;

  constructor(position: Vector2) {
    super(position);

    this.defaultHeroPosition = new Vector2(gridCells(8), gridCells(8));
  }

  /**
   * Prüft, ob ein Item mit dem angegebenen imageKey bereits im Inventar vorhanden ist.
   */
  protected isInInventory(imageKey: keyof typeof resources.images): boolean {
    const raw = localStorage.getItem(inventoryStorageKey);
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
}
