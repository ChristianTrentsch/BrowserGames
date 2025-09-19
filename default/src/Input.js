export const LEFT = "LEFT";
export const RIGHT = "RIGHT";
export const UP = "UP";
export const DOWN = "DOWN";

export class Input {
  constructor() {
    this.heldDirections = [];

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.onArrowPressed(LEFT);
          break;
        case "ArrowRight":
          this.onArrowPressed(RIGHT);
          break;
        case "ArrowUp":
          this.onArrowPressed(UP);
          break;
        case "ArrowDown":
          this.onArrowPressed(DOWN);
          break;
        case "KeyA":
          this.onArrowPressed(LEFT);
          break;
        case "KeyD":
          this.onArrowPressed(RIGHT);
          break;
        case "KeyW":
          this.onArrowPressed(UP);
          break;
        case "KeyS":
          this.onArrowPressed(DOWN);
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.onArrowReleased(LEFT);
          break;
        case "ArrowRight":
          this.onArrowReleased(RIGHT);
          break;
        case "ArrowUp":
          this.onArrowReleased(UP);
          break;
        case "ArrowDown":
          this.onArrowReleased(DOWN);
          break;
        case "KeyA":
          this.onArrowReleased(LEFT);
          break;
        case "KeyD":
          this.onArrowReleased(RIGHT);
          break;
        case "KeyW":
          this.onArrowReleased(UP);
          break;
        case "KeyS":
          this.onArrowReleased(DOWN);
          break;
      }
    });
  }

  get direction() {
    return this.heldDirections[0];
  }

  onArrowPressed(direction) {
    // Add this arrow to the queue if it's new
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  onArrowReleased(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index === -1) {
      return;
    }

    // Remove this key from the list
    this.heldDirections.splice(index, 1);
  }
}
