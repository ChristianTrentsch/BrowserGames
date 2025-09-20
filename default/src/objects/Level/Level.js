import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { gridCells } from "../../helpers/grid.js";

export class Level extends GameObject {
  constructor() {
    super({});

    this.background = null;
    this.defaultHeroPosition = new Vector2(gridCells(8), gridCells(4));
  }
}
