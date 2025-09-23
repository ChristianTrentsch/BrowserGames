import { GameObject } from "../../GameObject.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { gridCells } from "../../helpers/grid.js";

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
}
