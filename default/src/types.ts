import { Vector2 } from "./Vector2.js";

/* Types */
export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN" | "SPACE" | "ITEM1" | "ITEM2" | "RELOAD" | "ATTACK";
export type EventName = "HERO_POSTION" | "HERO_PICKS_UP_ITEM" | "HERO_EXITS" | "HERO_REQUESTS_ACTION" | "CHANGE_LEVEL" | "TEXTBOX_START" | "TEXTBOX_END";
export type ArrowKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
export type WASDKey = "KeyW" | "KeyA" | "KeyS" | "KeyD";
export type ActionKey = "Space" | "KeyE" | "KeyQ" | "KeyF" | "KeyR";
export type InputKey = ArrowKey | WASDKey | ActionKey;
export type KeysState = Record<InputKey, boolean>;

/* Interfaces */
export interface NewLevelConfig {
    config: {
        position: Vector2;
        heroPosition: Vector2;
    }
};