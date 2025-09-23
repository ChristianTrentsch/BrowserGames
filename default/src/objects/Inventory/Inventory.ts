import { GameObject, HUD } from "../../GameObject.js";
import { ResourceImageOptions, resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { events, HERO_PICKS_UP_ITEM } from "../../Events.js";

export class Inventory extends GameObject {
  nextId: number;
  items: {
    id: number
    image: ResourceImageOptions
  }[];

  constructor() {
    super(new Vector2(0, 1));

    this.drawLayer = HUD;
    this.nextId = 0;
    this.items = [
      // {
      //   id: -1,
      //   image: resources.images.rod,
      // }
    ];

    // Inventory add item
    events.on(HERO_PICKS_UP_ITEM, this, (data) => {
      // Show Item on Screen
      this.nextId += 1;
      this.items.push({
        id: this.nextId,
        image: resources.images.rod,
      });
      this.renderInventory();
    });

    // Demo to show removing from inventroy
    // setTimeout(() => {
    //   this.removeFromInventory(-2);
    // }, 2000);

    // Draw initial state on bootup
    this.renderInventory();
  }

  renderInventory() {
    // Remove old drawings
    this.children.forEach((child) => child.destroy());

    // Draw fresh inventory items
    this.items.forEach((item, index) => {
      const sprite = new Sprite({
        resource: item.image,
        position: new Vector2(index * 12, 0),
      });
      this.addChild(sprite);
    });
  }

  removeFromInventory(id: number) {
    this.items = this.items.filter((item) => item.id !== id);
    this.renderInventory();
  }
}
