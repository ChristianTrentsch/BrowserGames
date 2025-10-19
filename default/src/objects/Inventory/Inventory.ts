import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events, HERO_PICKS_UP_ITEM, HERO_USE_ITEM } from "../../Events.js";
import { SaveGame } from "../../SaveGame.js";
import { getCharacterFrame, getCharacterWidth } from "../SpriteTextString/spriteFontMap.js";
import { TREE, STONE, BUSH, Item } from "../Item/Item.js";

export const INVENTORY_ITEMS = [TREE, STONE, BUSH] as const;
export type InventoryUnion = typeof INVENTORY_ITEMS[number];

export interface InventoryItemData {
  id: number;
  name: InventoryUnion;
  amount: number;
}

export class Inventory extends GameObject {
  nextId: number;
  items: InventoryItemData[];

  constructor() {
    super(new Vector2(1, 1));

    this.drawLayer = "HUD";
    this.nextId = 0;

    // Inventar laden
    this.items = SaveGame.loadInventory();

    // Nur prüfen, wenn das Inventar nicht leer ist
    if (this.items.length > 0) {
      const inventarItem = this.items.find(item => INVENTORY_ITEMS.includes(item.name));

      if (inventarItem) {
        // Wenn Resource, Menge erhöhen
        inventarItem.amount += 1;
      }

      // nextId auf höchsten ID-Wert setzen
      this.nextId = Math.max(...this.items.map(item => item.id));
    }

    // Demo to show removing from inventroy
    // setTimeout(() => {
    //   this.removeFromInventory(-2);
    // }, 2000);

    // Draw initial state on bootup
    this.renderInventory();
  }

  ready() {
    // Event Inventory add item
    events.on(HERO_PICKS_UP_ITEM, this, (data: { name: InventoryUnion }) => {
      const { name } = data;

      const existingItem = this.items.find(item => item.name === name);
      if (existingItem && INVENTORY_ITEMS.includes(existingItem.name)) {
        // Wenn gefunden Resource, Menge erhöhen
        existingItem.amount += 1;
      }
      else if (!existingItem && INVENTORY_ITEMS.includes(name)) {
        // neues Item hinzufügen
        this.nextId += 1;
        this.items.push({
          id: this.nextId,
          name: name,
          amount: 1
        });
      }

      // Save inventory in localStorage
      SaveGame.saveInventory(this.items.map((i) => ({
        id: i.id,
        name: i.name,
        amount: i.amount
      })));

      // Draw initial state
      this.renderInventory();
    });


    // Listen for use Item event
    events.on(HERO_USE_ITEM, this, (data: { name: InventoryUnion }) => {
      const { name } = data;

      // Draw initial state
      this.removeFromInventory(name);
    });
  }

  renderInventory() {
    // Remove old drawings
    this.children.forEach((child) => child.destroy());

    // Nur Items mit amount > 0 für die Darstellung
    const visibleItems = this.items.filter(item => item.amount > 0);

    // Draw fresh inventory items
    visibleItems.forEach((item, index) => {

      const frameSize = 24;
      const zIndex = 0.01
      const baseX = index * frameSize;
      const baseY = 0;

      // Item Background zeichnen
      const background = new Sprite({
        resource: resources.images.inventoryItemFrame,
        position: new Vector2(baseX, baseY - zIndex),
        frameSize: new Vector2(24, 24),
      });
      this.addChild(background);

      // Bild passend zum Item ermitteln
      const frame = Item.getCollectibleItemFrame(item.name);

      // Item zeichnen
      const sprite = new Sprite({
        resource: resources.images.collectible,
        position: new Vector2(baseX + 4, baseY + 4),
        hFrames: 20,
        frame: frame,
      });
      this.addChild(sprite);

      // Anzahl gesammelter Resourcen prüfen und Darstellen
      if (item.amount > 1) {
        const text = String(item.amount);
        let xOffset = baseX + 8; // etwas nach rechts vom Item
        const yOffset = baseY + 12; // leicht nach oben

        // Jede Ziffer zeichnen
        for (const char of text) {
          const charWidth = getCharacterWidth(char);

          const numberSprite = new Sprite({
            position: new Vector2(xOffset, yOffset),
            resource: resources.images.fontWhite, // Font-/Alphabet-SpriteSheet
            hFrames: 13,
            vFrames: 6,
            frame: getCharacterFrame(char),
            // scale: 0.9,
          });

          this.addChild(numberSprite);
          xOffset += charWidth + 1; // etwas Abstand zwischen den Ziffern
        }
      }
    });
  }

  removeFromInventory(name: InventoryUnion) {
    this.items = this.items.filter((item) => item.name !== name);
    this.renderInventory();
  }

  /**
   * Prüft, ob der Spieler mindestens `amount` Stück einer Resource besitzt.
   * @param name - der Schlüssel der Resource (z. B. "treeResource")
   * @param amount - die benötigte Menge
   * @returns true, wenn genügend vorhanden ist, sonst false
  */
  hasResource(name: InventoryUnion, amount: number): boolean {
    const item = this.items.find(i => i.name === name);
    return !!item && item.amount >= amount;
  }

  /**
   * Entfernt eine bestimmte Menge einer Resource aus dem Inventar.
   * Wenn die Menge auf 0 sinkt, wird die Item.amount auf 0 gesetzt
   * Die Liste der Items wird neu sortiert je nach Item.amount
   * @param name - der Schlüssel der Resource
   * @param amount - die zu entfernende Menge
   */
  removeResource(name: InventoryUnion, amount: number): void {
    const item = this.items.find(i => i.name === name);
    if (!item) return;

    item.amount -= amount;

    // Falls Anzahl <= 0 dann Anzahl auf 0 setzen
    if (item.amount <= 0) {
      item.amount = 0;
    }

    // Sortiere Items: zuerst mit amount > 0, danach amount = 0
    this.items.sort((a, b) => {
      if (a.amount === 0 && b.amount > 0) return 1;
      if (a.amount > 0 && b.amount === 0) return -1;
      return 0;
    });

    // Änderungen speichern
    SaveGame.saveInventory(this.items.map(i => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
    })));

    // Darstellung aktualisieren
    this.renderInventory();
  }

  /**
   * Prüft, ob der Spieler mindestens `amount` Stück einer oder mehrerer Resourcen besitzt.
   * Entfernt eine bestimmte Menge einer Resource aus dem Inventar.
   * Wenn die Menge auf 0 sinkt, wird das Item komplett entfernt.
   * @param requirements - Array mit Resourcen Bedingung
   */
  completeQuest(requirements: { name: InventoryUnion; amount: number }[]): boolean {
    // Prüfen, ob alle Anforderungen erfüllt sind
    const allAvailable = requirements.every(req =>
      this.hasResource(req.name, req.amount)
    );

    if (!allAvailable) return false;

    // Resourcen abziehen, wenn erfüllt
    requirements.forEach(req => this.removeResource(req.name, req.amount));
    return true;
  }
}
