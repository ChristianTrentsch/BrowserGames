import { GameObject } from "../../GameObject.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";

/**
 * Base Level class.
 * Make it abstract and force subclasses to provide a `background: Sprite`.
 */
export abstract class Level extends GameObject {
  // Subclasses MUST provide a Sprite for the background
  abstract background: Sprite;
  abstract walls: Set<string>;
  abstract levelId: string; // jede Map muss eindeutige ID haben
  abstract defaultHeroPosition: Vector2;

  constructor(position: Vector2) {
    super(position);
  }

  /**
   * Erzeugt ein Array mit Koordinatenstrings für Spielfeldbegrenzungen.
   * - direction: "top", "bottom", "left", "right"
   */
  protected generateWall(
    start: Vector2,
    end: Vector2,
    step: number,
    direction: "top" | "bottom" | "left" | "right"
  ): string[] {
    const coords: string[] = [];

    switch (direction) {
      case "top":
      case "bottom":
        for (let x = start.x; x <= end.x; x += step) {
          coords.push(`${x},${start.y}`);
        }
        break;

      case "left":
      case "right":
        for (let y = start.y; y <= end.y; y += step) {
          coords.push(`${start.x},${y}`);
        }
        break;
    }

    return coords;
  }
}
