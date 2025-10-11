import { GameObject } from "./GameObject.js";
import { EquipmentEvent } from "./objects/Equipment/Equipment.js";
import { InventoryEvent } from "./objects/Inventory/Inventory.js";
import { Vector2 } from "./Vector2.js";

export type EventName =
  "HERO_POSTION" |
  "HERO_PICKS_UP_ITEM" |
  "HERO_USE_ITEM" |
  "HERO_EXITS" |
  "HERO_REQUESTS_ACTION" |
  "HERO_ATTACK_ACTION" |
  "HERO_CHANGE_EQUIPMENT" |
  "CHANGE_LEVEL" |
  "TEXTBOX_START" |
  "TEXTBOX_END";

export interface EventCallbackItem {
  id: number;
  eventName: EventName;
  caller: GameObject; // Optional: kannst du präziser typisieren, z.B. `object` oder `this`-Typ
  callback: (...args: any[]) => void; // Callback-Funktion mit beliebigen Parametern
}

export const HERO_POSTION = "HERO_POSTION";
export const HERO_PICKS_UP_ITEM = "HERO_PICKS_UP_ITEM";
export const HERO_USE_ITEM = "HERO_USE_ITEM";
export const HERO_EXITS = "HERO_EXITS";
export const HERO_REQUESTS_ACTION = "HERO_REQUESTS_ACTION";
export const HERO_ATTACK_ACTION = "HERO_ATTACK_ACTION";
export const HERO_CHANGE_EQUIPMENT = "HERO_CHANGE_EQUIPMENT";
export const CHANGE_LEVEL = "CHANGE_LEVEL";
export const TEXTBOX_START = "TEXTBOX_START";
export const TEXTBOX_END = "TEXTBOX_END";

class Events {
  private nextId = 0;
  private callbacks: EventCallbackItem[] = [];

  constructor() {
    console.log(`Events LOADED`, this);
  }

  // emit event
  emit(eventName: EventName, caller?: GameObject | Vector2 | InventoryEvent | EquipmentEvent) {
    this.callbacks.forEach((stored: { eventName: EventName, callback: (...args: any[]) => void }) => {
      if (stored.eventName === eventName) {
        stored.callback(caller);
      }
    });
  }

  // subscribe to something happening
  on(eventName: EventName, caller: GameObject, callback: (...args: any[]) => void) {
    this.nextId += 1;
    this.callbacks.push({
      id: this.nextId,
      eventName,
      caller,
      callback,
    });
    return this.nextId;
  }

  // remove a subscription
  off(id: number) {
    this.callbacks = this.callbacks.filter((stored) => stored.id !== id);
  }

  unsubscribe(caller: GameObject) {
    this.callbacks = this.callbacks.filter(
      (stored) => stored.caller !== caller
    );
  }
}

export const events = new Events();
