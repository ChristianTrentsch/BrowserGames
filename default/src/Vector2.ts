import { LEFT, RIGHT, UP, DOWN } from "./Input.js";
import { Direction } from "./types.js";

export class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  duplicate() {
    return new Vector2(this.x, this.y);
  }

  matches(otherVector2: Vector2) {
    return this.x === otherVector2.x && this.y === otherVector2.y;
  }

  toNeighbor(direction: Direction) {
    let x = this.x;
    let y = this.y;

    switch (direction) {
      case LEFT:
        x -= 16;
        break;
      case RIGHT:
        x += 16;
        break;
      case UP:
        y -= 16;
        break;
      case DOWN:
        y += 16;
        break;
    }

    return new Vector2(x, y);
  }
}
