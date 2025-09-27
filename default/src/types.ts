/* Types */
export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN" | "SPACE" | "ITEM1" | "ITEM2" | "RELOAD" | "ATTACK";
// export type ArrowKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
export type WASDKey = "KeyW" | "KeyA" | "KeyS" | "KeyD";
export type ActionKey = "Space" | "KeyE" | "KeyQ" | "KeyF" | "KeyR";
// export type InputKey = ArrowKey | WASDKey | ActionKey;
export type InputKey = WASDKey | ActionKey;
export type KeysState = Record<InputKey, boolean>;