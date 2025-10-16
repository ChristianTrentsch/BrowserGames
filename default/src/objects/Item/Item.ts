import { GameObject } from "../../GameObject.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { resources } from "../../Resource.js";
import { events, HERO_POSTION, HERO_PICKS_UP_ITEM } from "../../Events.js";
import { INVENTORY_BUSH, INVENTORY_STONE, INVENTORY_TREE, InventoryUnion } from "../Inventory/Inventory.js";
import { EQUIPMENT_ROD_PURPLE, EQUIPMENT_ROD_RED, EQUIPMENT_SWORD, EquipmentUnion } from "../Equipment/Equipment.js";

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

    const frame = resources.getCollectibleItemFrame(this.itemKey);
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
}
