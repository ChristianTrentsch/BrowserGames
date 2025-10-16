import { Vector2 } from "./Vector2.js";
import { events } from "./Events.js";
import { EquipmentUnion, EQUIPMENT_SWORD, EQUIPMENT_ROD_PURPLE, EQUIPMENT_ROD_RED } from "./objects/Equipment/Equipment.js";
import { InventoryUnion, INVENTORY_BUSH, INVENTORY_TREE, INVENTORY_STONE } from "./objects/Inventory/Inventory.js";

export type DrawLayer = "HUD" | "FLOOR";

export class GameObject {

  position: Vector2;
  children: Array<GameObject>;
  parent: null | GameObject;
  hasReadyBeenCalled: boolean;
  isSolid: null | boolean;
  drawLayer: null | DrawLayer;

  constructor(position: Vector2) {
    this.position = position ?? new Vector2(0, 0);
    this.children = [];
    this.parent = null;
    this.hasReadyBeenCalled = false;

    this.isSolid = false; // use to check if player gets blocked by npc , etc.
    this.drawLayer = null; // kinda like z-index
  }

  // First entry point of the loop
  stepEntry(delta: number, root: GameObject) {
    // Call updates on all children first
    if (this.children) {
      this.children.forEach((child) => child.stepEntry(delta, root));
    }

    // Call ready on the first frame
    if (!this.hasReadyBeenCalled) {
      this.hasReadyBeenCalled = true;
      this.ready();
    }

    // Call any implemented Step code
    this.step(delta, root);
  }

  // Called before the first `step`
  ready() {
    // ...
  }

  // Called once every frame
  step(delta: number, root: GameObject) {
    // ...
  }

  /* draw entry */
  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const drawPosX = x + this.position.x;
    const drawPosY = y + this.position.y;

    // Do the actual rendering for Images
    this.drawImage(ctx, drawPosX, drawPosY);

    // Pass on to children
    this.getDrawChildrenOrdered().forEach((child) =>
      child.draw(ctx, drawPosX, drawPosY)
    );
  }

  getDrawChildrenOrdered() {
    return [...this.children].sort((a, b) => {
      // always under feet
      if (b.drawLayer === "FLOOR") {
        return 1;
      }

      return a.position.y > b.position.y ? 1 : -1;
    });
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    //...
  }

  // Remove from the tree
  destroy() {
    this.children.forEach((child) => {
      child.destroy();
    });

    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  /* Other Game Objects are nestable inside this one */
  addChild(gameObject: GameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
  }

  removeChild(gameObject: GameObject) {
    // console.log("GameObject.removeChild ", gameObject);
    events.unsubscribe(gameObject);
    this.children = this.children.filter((g) => {
      return gameObject !== g;
    });
  }
}
