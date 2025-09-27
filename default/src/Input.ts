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

  private currentInputMode: "keyboard" | "controller" = "keyboard";

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
      this.currentInputMode = "keyboard";
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
      this.currentInputMode = "keyboard";
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

    // console.log(this.currentInputMode);

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

    // ersten Controller nehmen
    const gp = gamepads[0];
    if (!gp) return;

    // D-Pad oder Stick -> Bewegung
    const [xAxis, yAxis] = gp.axes;
    const threshold = 0.4;
    const controllerActive =
      gp.buttons.some((btn) => btn.pressed) ||
      Math.abs(xAxis as number) > threshold ||
      Math.abs(yAxis as number) > threshold;

    if (controllerActive) {
      this.currentInputMode = "controller";
    }

    // Wenn Tastatur aktiv → Gamepad ignorieren
    if (this.currentInputMode !== "controller") {
      return;
    }

    this.resetDirectionsFromGamepad();

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
    this.mapButton(gp.buttons[0], "Space", this.keyToDirection);  // A -> Interact
    this.mapButton(gp.buttons[1], "KeyF", this.keyToDirection);   // B -> Attack
    this.mapButton(gp.buttons[2], "KeyQ", this.keyToDirection);   // X -> Item2
    this.mapButton(gp.buttons[3], "KeyE", this.keyToDirection);   // Y -> Item1
    this.mapButton(gp.buttons[9], "KeyR", this.keyToDirection);   // Start -> Reload
  }

  private mapButton(button: GamepadButton | undefined, key: InputKey, keyToDirection: Record<InputKey, Direction>) {
    if (!button) return;

    if (button.pressed) {
      if (!this.keys[key]) {
        this.keys[key] = true;

        // Wenn der Key auch eine Richtung ist → Richtung aktivieren
        const dir = keyToDirection[key];
        if (dir) {
          this.onArrowPressed(dir);
        }
      }
    } else {
      if (this.keys[key]) {
        this.keys[key] = false;

        // Richtung ggf. wieder freigeben
        const dir = keyToDirection[key];
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
