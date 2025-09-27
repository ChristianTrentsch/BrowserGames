import { InputKey, KeysState } from "./types.js";

export const LEFT = "LEFT";
export const RIGHT = "RIGHT";
export const UP = "UP";
export const DOWN = "DOWN";
export const SPACE = "SPACE";
export const ITEM1 = "ITEM1";
export const ITEM2 = "ITEM2";
export const RELOAD = "RELOAD";
export const ATTACK = "ATTACK";

export class Input {

  heldDirections: (typeof LEFT | typeof RIGHT | typeof UP | typeof DOWN | typeof SPACE | typeof ATTACK | typeof RELOAD | typeof ITEM1 | typeof ITEM2)[];
  keys: KeysState;
  lastKeys: KeysState;

  constructor() {
    this.heldDirections = [];
    this.keys = {
      // ArrowLeft: false,
      // ArrowRight: false,
      // ArrowUp: false,
      // ArrowDown: false,
      KeyW: false,
      KeyA: false,
      KeyS: false,
      KeyD: false,
      Space: false,
      KeyE: false,
      KeyR: false,
      KeyQ: false,
      KeyF: false,
    };
    this.lastKeys = { ...this.keys };

    const keyToDirection: Record<
      InputKey,
      typeof LEFT | typeof RIGHT | typeof UP | typeof DOWN | typeof SPACE | typeof ATTACK | typeof RELOAD | typeof ITEM1 | typeof ITEM2
    > = {
      // ArrowLeft: LEFT,
      // ArrowRight: RIGHT,
      // ArrowUp: UP,
      // ArrowDown: DOWN,
      KeyA: LEFT,
      KeyD: RIGHT,
      KeyW: UP,
      KeyS: DOWN,
      Space: SPACE,
      KeyE: ITEM1,
      KeyQ: ITEM2,
      KeyR: RELOAD,
      KeyF: ATTACK,
    };

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const key = e.code as InputKey;

      // Read every Key from Keyboard
      // console.log(`KEY PRESSED: ${key}`);

      if (key in this.keys) {
        this.keys[key] = true;
        this.onArrowPressed(keyToDirection[key]);
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      const key = e.code as InputKey;
      if (key in this.keys) {
        this.keys[key] = false;
        this.onArrowReleased(keyToDirection[key]);
      }
    });
  }

  get direction() {
    return this.heldDirections[0];
  }

  update() {
    // Diff the keys on previous frame to know when new ones are pressed
    this.lastKeys = { ...this.keys };
  }

  getActionJustPressed(keyCode: InputKey) {
    let justPressed = false;
    if (this.keys[keyCode] && !this.lastKeys[keyCode]) {
      justPressed = true;
    }

    return justPressed;
  }

  onArrowPressed(direction: typeof LEFT | typeof RIGHT | typeof UP | typeof DOWN | typeof SPACE | typeof ATTACK | typeof RELOAD | typeof ITEM1 | typeof ITEM2) {
    // Add this arrow to the queue if it's new
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  onArrowReleased(direction: typeof LEFT | typeof RIGHT | typeof UP | typeof DOWN | typeof SPACE | typeof ATTACK | typeof RELOAD | typeof ITEM1 | typeof ITEM2) {
    const index = this.heldDirections.indexOf(direction);
    // Remove this key from the list
    if (index !== -1) this.heldDirections.splice(index, 1);
  }
}
