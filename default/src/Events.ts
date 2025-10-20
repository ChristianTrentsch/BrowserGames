import { GameObject } from "./GameObject.js";
import { EquipmentUnion } from "./objects/Equipment/Equipment.js";
import { InventoryUnion } from "./objects/Inventory/Inventory.js";
import { ResourceImageOptions } from "./Resource.js";
import { Vector2 } from "./Vector2.js";

export const HERO_POSTION = "HERO_POSTION";
export const HERO_PICKS_UP_ITEM = "HERO_PICKS_UP_ITEM";
export const HERO_USE_ITEM = "HERO_USE_ITEM";
export const HERO_EXITS = "HERO_EXITS";
export const HERO_REQUESTS_ACTION = "HERO_REQUESTS_ACTION";
export const HERO_ATTACK_ACTION = "HERO_ATTACK_ACTION";
export const HERO_CHANGE_EQUIPMENT = "HERO_CHANGE_EQUIPMENT";
export const HERO_CHANGE_EXP = "HERO_CHANGE_EXP";

export const CHANGE_LEVEL = "CHANGE_LEVEL";
export const TEXTBOX_START = "TEXTBOX_START";
export const TEXTBOX_END = "TEXTBOX_END";
export const RES_DESTROY = "RES_DESTROY";

export const EVENT_ITEMS = [
  HERO_POSTION,
  HERO_PICKS_UP_ITEM,
  HERO_USE_ITEM,
  HERO_EXITS,
  HERO_REQUESTS_ACTION,
  HERO_ATTACK_ACTION,
  HERO_CHANGE_EQUIPMENT,
  HERO_CHANGE_EXP,

  CHANGE_LEVEL,
  TEXTBOX_START,
  TEXTBOX_END,
  RES_DESTROY,
] as const;

export type EventUnion = typeof EVENT_ITEMS[number];

export interface EventCallbackItem {
  id: number;
  eventName: EventUnion;
  caller: GameObject; // Optional: kannst du präziser typisieren, z.B. `object` oder `this`-Typ
  callback: (...args: any[]) => void; // Callback-Funktion mit beliebigen Parametern
}

export interface EventCollectible {
  name: EquipmentUnion | InventoryUnion
  position: Vector2
  image: ResourceImageOptions
  itemSound: HTMLAudioElement
}

export interface EventGainXp {
  exp: number,
  level: number,
  // heroPos: Vector2
}

class Events {
  private nextId = 0;
  private callbacks: EventCallbackItem[] = [];

  constructor() {
    // console.log(`Events LOADED`, this);
  }

  // emit event
  emit(eventName: EventUnion, caller?: GameObject | Vector2 | EventCollectible | EventGainXp) {
    this.callbacks.forEach((stored: { eventName: EventUnion, callback: (...args: any[]) => void }) => {
      if (stored.eventName === eventName) {
        stored.callback(caller);
      }
    });
  }

  // subscribe to something happening
  on(eventName: EventUnion, caller: GameObject, callback: (...args: any[]) => void) {
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
