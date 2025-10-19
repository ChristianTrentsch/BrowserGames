import { GameObject } from "../../GameObject.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { resources } from "../../Resource.js";
import { events, HERO_POSTION, HERO_PICKS_UP_ITEM } from "../../Events.js";
import { InventoryUnion } from "../Inventory/Inventory.js";
import { EquipmentUnion } from "../Equipment/Equipment.js";

export const TREE = "tree";
export const STONE = "stone";
export const BUSH = "bush";
export const SWORD = "sword";
export const ROD_PURPLE = "rodPurple";
export const ROD_RED = "rodRed";

export class Item extends GameObject {

  itemKey: InventoryUnion | EquipmentUnion;
  itemSound: HTMLAudioElement;

  constructor(
    x: number,
    y: number,
    itemKey: InventoryUnion | EquipmentUnion,
    itemSoundSrc: string = "./sounds/items/pick_up_item_01.mp3", // Pfad zur Standard Sounddatei
    volume: number = 0.7 // Standard-Lautstärke
  ) {
    super(new Vector2(x, y));

    this.itemKey = itemKey;
    this.itemSound = new Audio(itemSoundSrc);
    this.itemSound.volume = volume; // Lautstärke setzen (0.0 - 1.0)

    const frame = Item.getCollectibleItemFrame(this.itemKey);
    this.addChild(
      new Sprite({
        resource: resources.images.collectible,
        position: new Vector2(0, -5), // optisch nach oben ausrichten
        hFrames: 20,
        frame: frame, // Bild passend zum Item ermitteln
      })
    );
  }

  ready() {
    events.on(HERO_POSTION, this, (pos) => {
      // detect overlap...
      const roundedHeroX = Math.round(pos.x);
      const roundedHeroY = Math.round(pos.y);
      if (
        roundedHeroX === this.position.x &&
        roundedHeroY === this.position.y
      ) {
        // Hit the Item
        this.onCollideWithHero();
      }
    });
  }

  onCollideWithHero() {
    // Listener entfernen, damit kein mehrfaches Triggern passiert
    events.unsubscribe(this);

    // Audio stoppen
    this.itemSound.pause();
    this.itemSound.currentTime = 0;

    // Remove this instance from the scene
    this.destroy();

    // Alert that we picked up a rod
    events.emit(HERO_PICKS_UP_ITEM, {
      name: this.itemKey,
      image: resources.images.collectible,
      position: this.position,
      itemSound: this.itemSound
    });
  }

  /** 
   * Helper Methode
   * - Du brauchst das passende Bild zu einem Item was man einsammeln kann?
   * - Dann nutze deinen ItemNamen um den richtigen frame zu ermitteln.
   * @param itemKey ItemName um collectible Bild zu ermitteln
   * */
  static getCollectibleItemFrame(itemKey: InventoryUnion | EquipmentUnion): number {
    let frame: number;
    switch (itemKey) {
      case BUSH:
        frame = 11;
        break;
      case TREE:
        frame = 12;
        break;
      case STONE:
        frame = 13;
        break;
      case SWORD:
        frame = 0;
        break;
      case ROD_PURPLE:
        frame = 1;
        break;
      case ROD_RED:
        frame = 2;
        break;
      default:
        frame = 19;
        break;
    }
    return frame;
  }
}
