/* Types */
export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN";
export type ArrowKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
export type WASDKey = "KeyW" | "KeyA" | "KeyS" | "KeyD";
export type ActionKey = "Space" | "KeyE" | "KeyQ" | "KeyF" | "KeyR";
export type InputKey = ArrowKey | WASDKey | ActionKey;
export type KeysState = Record<InputKey, boolean>;