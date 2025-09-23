import { GameObject, HUD } from "../../GameObject.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events, HERO_PICKS_UP_ITEM, HERO_USE_ITEM } from "../../Events.js";

export const inventoryStorageKey = 'inventory';

export class Inventory extends GameObject {
  nextId: number;
  items: {
    id: number;
    image: ResourceImageOptions;
    imageKey: keyof typeof resources.images;
  }[];

  constructor() {
    super(new Vector2(0, 1));

    this.drawLayer = HUD;
    this.nextId = 0;
    this.items = [];

    // Inventar laden
    this.loadInventory();

    // nextId auf den höchsten bestehenden ID-Wert setzen
    if (this.items.length > 0) {
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
    // Inventory add item
    events.on(HERO_PICKS_UP_ITEM, this, (data: { imageKey: keyof typeof resources.images }) => {
      const { imageKey } = data;

      // Prüfen, ob Item schon vorhanden ist
      const alreadyHasItem = this.items.some(item => item.imageKey === imageKey);
      if (alreadyHasItem) {
        console.warn(`Item ${imageKey} ist bereits im Inventar`);
        return;
      }

      // Show Item on Screen
      this.nextId += 1;
      this.items.push({
        id: this.nextId,
        image: resources.images[imageKey],
        imageKey: imageKey
      });

      // Save inventory in localStorage
      this.saveInventory();

      // Draw initial state
      this.renderInventory();
    });


    // Inventory use item
    events.on(HERO_USE_ITEM, this, (data: { imageKey: keyof typeof resources.images }) => {
      const { imageKey } = data;


      // Save inventory in localStorage
      this.loadInventory();

      // Draw initial state
      this.removeFromInventory(imageKey);
    });
  }

  renderInventory() {
    // Remove old drawings
    this.children.forEach((child) => child.destroy());

    // Draw fresh inventory items
    this.items.forEach((item, index) => {
      const sprite = new Sprite({
        // resource: item.image,
        resource: resources.images[item.imageKey],
        position: new Vector2(index * 12, 0),
      });
      this.addChild(sprite);
    });
  }

  removeFromInventory(imageKey: keyof typeof resources.images) {
    this.items = this.items.filter((item) => item.imageKey !== imageKey);
    this.renderInventory();
  }

  saveInventory() {
    localStorage.setItem(inventoryStorageKey, JSON.stringify(this.items));
  }

  loadInventory() {
    const raw = localStorage.getItem(inventoryStorageKey);
    if (raw) {
      this.items = JSON.parse(raw);
    }
  }

}
