import { Direction, InputKey, KeysState } from "./types.js";

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

  heldDirections: Direction[];
  keys: KeysState;
  lastKeys: KeysState;

  private keyToDirection: Record<InputKey, Direction> = {
    ArrowLeft: LEFT,
    ArrowRight: RIGHT,
    ArrowUp: UP,
    ArrowDown: DOWN,
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

  constructor() {
    this.heldDirections = [];
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
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

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const key = e.code as InputKey;

      // Leertaste + Pfeile
      const keysToBlock = [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      // verhindert das Scrollen (Standard verhalten entfernen)
      if (keysToBlock.includes(e.key)) {
        e.preventDefault();
      }

      if (key in this.keys) {
        this.keys[key] = true;
        this.onArrowPressed(this.keyToDirection[key]);
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      const key = e.code as InputKey;
      if (key in this.keys) {
        this.keys[key] = false;
        this.onArrowReleased(this.keyToDirection[key]);
      }
    });

    // Events für Gamepad
    window.addEventListener("gamepadconnected", (e) => {
      console.log("Gamepad verbunden:", e.gamepad);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("Gamepad getrennt:", e.gamepad);
    });
  }

  get direction() {
    return this.heldDirections[0];
  }

  update() {
    // Diff the keys on previous frame to know when new ones are pressed
    this.lastKeys = { ...this.keys };

    // Controller abfragen
    this.pollGamepad();
  }

  getActionJustPressed(keyCode: InputKey) {
    let justPressed = false;
    if (this.keys[keyCode] && !this.lastKeys[keyCode]) {
      justPressed = true;
    }

    return justPressed;
  }

  onArrowPressed(direction: Direction) {
    // Add this arrow to the queue if it's new
    if (this.heldDirections.indexOf(direction) === -1) {
      this.heldDirections.unshift(direction);
    }
  }

  onArrowReleased(direction: Direction) {
    const index = this.heldDirections.indexOf(direction);
    // Remove this key from the list
    if (index !== -1) this.heldDirections.splice(index, 1);
  }

  /** Poll Gamepad state */
  private pollGamepad() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    const gp = gamepads[0]; // ersten Controller nehmen
    if (!gp) return;

    // 🎮 D-Pad oder Stick -> Bewegung
    const threshold = 0.4;
    this.resetDirectionsFromGamepad();

    const [xAxis, yAxis] = gp.axes;

    if (xAxis) {
      if (xAxis < -threshold) this.onArrowPressed("LEFT");
      if (xAxis > threshold) this.onArrowPressed("RIGHT");
    }

    if (yAxis) {
      if (yAxis < -threshold) this.onArrowPressed("UP");
      if (yAxis > threshold) this.onArrowPressed("DOWN");
    }

    if (gp.buttons[14]?.pressed) this.onArrowPressed("LEFT");  // D-Pad links
    if (gp.buttons[15]?.pressed) this.onArrowPressed("RIGHT"); // D-Pad rechts
    if (gp.buttons[12]?.pressed) this.onArrowPressed("UP");    // D-Pad hoch
    if (gp.buttons[13]?.pressed) this.onArrowPressed("DOWN");  // D-Pad runter

    // 🎮 Buttons -> Aktionen (Xbox Mapping)
    this.mapButton(gp.buttons[0], "Space");  // A -> Interact
    this.mapButton(gp.buttons[1], "KeyF");   // B -> Attack
    this.mapButton(gp.buttons[2], "KeyQ");   // X -> Item2
    this.mapButton(gp.buttons[3], "KeyE");   // Y -> Item1
    this.mapButton(gp.buttons[9], "KeyR");   // Start -> Reload
  }

  private mapButton(button: GamepadButton | undefined, key: InputKey) {
    if (!button) return;

    if (button.pressed) {
      if (!this.keys[key]) {
        this.keys[key] = true;

        // Wenn der Key auch eine Richtung ist → Richtung aktivieren
        const dir = this.keyToDirection[key];
        if (dir) {
          this.onArrowPressed(dir);
        }
      }
    } else {
      if (this.keys[key]) {
        this.keys[key] = false;

        // Richtung ggf. wieder freigeben
        const dir = this.keyToDirection[key];
        if (dir) {
          this.onArrowReleased(dir);
        }
      }
    }
  }

  private resetDirectionsFromGamepad() {
    ["LEFT", "RIGHT", "UP", "DOWN"].forEach((dir) => this.onArrowReleased(dir as Direction));
  }
}
