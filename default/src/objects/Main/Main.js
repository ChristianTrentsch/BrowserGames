import { GameObject } from "../../GameObject.js";
import { Camera } from "../../Camera.js";
import { Input } from "../../Input.js";
import { Inventory } from "../Inventory/Inventory.js";
import { events } from "../../Events.js";

export class Main extends GameObject {
  constructor() {
    super({});

    this.level = null;
    this.input = new Input();
    this.camera = new Camera();
    this.inventory = new Inventory();
  }

  ready() {
    events.on(events.CHANGE_LEVEL, this, (newLevelInstance) => {
      // aconsole.log("Main: ", events.CHANGE_LEVEL);

      this.setLevel(newLevelInstance);
    });
  }

  setLevel(newLevelInstance) {
    // Delete old level before create new one
    if (this.level) {
      this.level.destroy();
    }

    this.level = newLevelInstance;
    this.addChild(this.level);
  }

  drawBackground(ctx) {
    // ...

    this.level?.background.drawImage(ctx, 0, 0);
  }

  drawForeground(ctx) {
    // ...

    this.inventory.draw(ctx, 0, 0);
  }
}
