import { GameObject } from "../../GameObject.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events, HERO_PICKS_UP_ITEM, HERO_USE_ITEM } from "../../Events.js";
import { SaveGame } from "../../SaveGame.js";
import { getCharacterFrame, getCharacterWidth } from "../SpriteTextString/spriteFontMap.js";

export const INVENTORY_ITEMS = ["treeRessource", "stoneRessource", "bushRessource"] as const;
export type InventoryItem = typeof INVENTORY_ITEMS[number];

export interface InventoryItemData {
  id: number;
  imageKey: InventoryItem;
  amount: number;
}

export interface InventoryEvent {
  imageKey: InventoryItem
  position: Vector2
  image: ResourceImageOptions
  itemSound: HTMLAudioElement
}

export class Inventory extends GameObject {
  nextId: number;
  items: {
    id: number;
    image: ResourceImageOptions;
    imageKey: InventoryItem;
    amount: number;
  }[];

  constructor() {
    super(new Vector2(1, 1));

    this.drawLayer = "HUD";
    this.nextId = 0;

    // Inventar laden
    this.items = SaveGame.loadInventory().map((item) => ({
      ...item,
      image: resources.images[item.imageKey],
    }));

    // Nur prüfen, wenn das Inventar nicht leer ist
    if (this.items.length > 0) {
      const ressourceItem = this.items.find(item => INVENTORY_ITEMS.includes(item.imageKey));

      if (ressourceItem) {
        // Wenn Baum, Menge erhöhen
        ressourceItem.amount += 1;
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
    events.on(HERO_PICKS_UP_ITEM, this, (data: { imageKey: InventoryItem }) => {
      const { imageKey } = data;

      const existingItem = this.items.find(item => item.imageKey === imageKey);
      if (existingItem) {
        if (INVENTORY_ITEMS.includes(existingItem.imageKey)) {
          // Wenn Baum, Menge erhöhen
          existingItem.amount += 1;
        }
      }
      else {
        if (INVENTORY_ITEMS.includes(imageKey)) {
          // neues Item hinzufügen
          this.nextId += 1;
          this.items.push({
            id: this.nextId,
            image: resources.images[imageKey],
            imageKey: imageKey,
            amount: 1
          });
        }
      }

      // Save inventory in localStorage
      SaveGame.saveInventory(this.items.map((i) => ({
        id: i.id,
        imageKey: i.imageKey,
        amount: i.amount
      })));

      // Draw initial state
      this.renderInventory();
    });


    // Listen for use Item event
    events.on(HERO_USE_ITEM, this, (data: { imageKey: keyof typeof resources.images }) => {
      const { imageKey } = data;

      // Draw initial state
      this.removeFromInventory(imageKey);
    });
  }

  renderInventory() {
    // Remove old drawings
    this.children.forEach((child) => child.destroy());

    // Draw fresh inventory items
    this.items.forEach((item, index) => {

      const baseX = index * 25;
      const baseY = 0;

      // Item Background zeichnen
      const background = new Sprite({
        resource: resources.images.inventoryItemFrame,
        position: new Vector2(baseX - 0.01, baseY - 0.01), // funktioniert wie z-Index
        frameSize: new Vector2(24, 24),
      });
      this.addChild(background);

      // Item zeichnen
      const sprite = new Sprite({
        resource: resources.images[item.imageKey],
        position: new Vector2(baseX + 4, baseY + 4),
      });
      this.addChild(sprite);

      // Wenn Item von type Baum dann Zahl passend zum amount zeichnen 
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

  removeFromInventory(imageKey: keyof typeof resources.images) {
    this.items = this.items.filter((item) => item.imageKey !== imageKey);
    this.renderInventory();
  }

  /**
   * Prüft, ob der Spieler mindestens `amount` Stück einer Ressource besitzt.
   * @param imageKey - der Schlüssel der Ressource (z. B. "treeRessource")
   * @param amount - die benötigte Menge
   * @returns true, wenn genügend vorhanden ist, sonst false
  */
  hasResource(imageKey: InventoryItem, amount: number): boolean {
    const item = this.items.find(i => i.imageKey === imageKey);
    return !!item && item.amount >= amount;
  }

  /**
   * Entfernt eine bestimmte Menge einer Ressource aus dem Inventar.
   * Wenn die Menge auf 0 sinkt, wird das Item komplett entfernt.
   * @param imageKey - der Schlüssel der Ressource
   * @param amount - die zu entfernende Menge
   */
  removeResource(imageKey: InventoryItem, amount: number): void {
    const item = this.items.find(i => i.imageKey === imageKey);
    if (!item) return;

    item.amount -= amount;

    // Falls Menge <= 0 → Item komplett entfernen
    if (item.amount <= 0) {
      this.items = this.items.filter(i => i.imageKey !== imageKey);
    }

    // Änderungen speichern
    SaveGame.saveInventory(this.items.map(i => ({
      id: i.id,
      imageKey: i.imageKey,
      amount: i.amount,
    })));

    // Darstellung aktualisieren
    this.renderInventory();
  }

  /**
   * Prüft, ob der Spieler mindestens `amount` Stück einer oder mehrerer Ressourcen besitzt.
   * Entfernt eine bestimmte Menge einer Ressource aus dem Inventar.
   * Wenn die Menge auf 0 sinkt, wird das Item komplett entfernt.
   * @param requirements - Array mit Ressourcen Bedingung
   */
  completeQuest(requirements: { imageKey: InventoryItem; amount: number }[]): boolean {
    // Prüfen, ob alle Anforderungen erfüllt sind
    const allAvailable = requirements.every(req =>
      this.hasResource(req.imageKey, req.amount)
    );

    if (!allAvailable) return false;

    // Ressourcen abziehen, wenn erfüllt
    requirements.forEach(req => this.removeResource(req.imageKey, req.amount));
    return true;
  }
}
