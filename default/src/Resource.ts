import { EquipmentUnion, EQUIPMENT_SWORD, EQUIPMENT_ROD_PURPLE, EQUIPMENT_ROD_RED } from "./objects/Equipment/Equipment.js";
import { InventoryUnion, INVENTORY_BUSH, INVENTORY_TREE, INVENTORY_STONE } from "./objects/Inventory/Inventory.js";

export interface ResourceOptions {

  // Allgemein
  shadow: string;
  nothing: string;
  exit: string;

  // Player/Npc
  hero: string;
  knight: string;

  // HUD
  textBox: string;
  portraits: string;
  fontWhite: string;
  fontBlack: string;

  // Level - Outdoor
  outdoorBush: string;
  outdoorGround: string;
  outdoorHouse: string;
  outdoorSky: string;
  outdoorSquare: string;
  outdoorStone: string;
  outdoorSwamp: string;
  outdoorTree: string;
  outdoorWater: string;

  // Level - Cave
  caveGround: string;
  caveSky: string;

  // Inventory
  inventoryItemFrame: string;

  // Equipment 
  equipment: string;

  // Collectible
  collectible: string;

  // Weapon
  sword: string;
  rodRed: string;
  rodPurple: string;
};

export interface ResourceImageOptions {
  image: HTMLImageElement;
  isLoaded: boolean;
};

class Resources {

  toLoad: ResourceOptions;
  images: { [K in keyof ResourceOptions]: ResourceImageOptions }

  constructor() {
    console.log(`Resources LOADED`, this);

    this.toLoad = {

      // Allgemein
      shadow: "./images/sprites/shadow.png",
      nothing: "./images/sprites/nothing.png",
      exit: "./images/sprites/exit.png",

      // Player/Npc
      hero: "./images/sprites/character/hero-sheet.png",
      knight: "./images/sprites/character/knight-sheet-1.png",

      // HUD
      textBox: "./images/sprites/textbox/box.png",
      fontWhite: "./images/sprites/textbox/font_white.png",
      fontBlack: "./images/sprites/textbox/font_black.png",
      portraits: "./images/sprites/textbox/portraits.png",

      // Level - Outdoor
      outdoorBush: "./images/sprites/level/outdoor/bush.png",
      outdoorGround: "./images/sprites/level/outdoor/ground_01.png",
      outdoorHouse: "./images/sprites/level/outdoor/house.png",
      outdoorSky: "./images/sprites/level/outdoor/sky.png",
      outdoorSquare: "./images/sprites/level/outdoor/square.png",
      outdoorStone: "./images/sprites/level/outdoor/stone.png",
      outdoorSwamp: "./images/sprites/level/outdoor/swamp.png",
      outdoorTree: "./images/sprites/level/outdoor/tree.png",
      outdoorWater: "./images/sprites/level/outdoor/water.png",

      // Level - Cave
      caveGround: "./images/sprites/level/cave/ground_00.png",
      caveSky: "./images/sprites/level/cave/sky.png",

      // Inventory
      inventoryItemFrame: "./images/sprites/inventory/item_frame.png",

      // Equipment 
      equipment: "./images/sprites/equipment/equipment_01.png",

      // Collectibles
      collectible: "./images/sprites/collectible/collectible_00.png",

      // Weapon
      sword: "./images/sprites/animation/sword.png",
      rodPurple: "./images/sprites/animation/rod_purple.png",
      rodRed: "./images/sprites/animation/rod_red.png",
    };

    // A bucket to store all of our images
    this.images = Object.keys(this.toLoad).reduce((acc, key) => {
      acc[key as keyof ResourceOptions] = {
        image: new Image(),
        isLoaded: false,
      };
      return acc;
    }, {} as { [K in keyof ResourceOptions]: ResourceImageOptions });

    // Load all of the images
    (Object.keys(this.toLoad) as (keyof ResourceOptions)[]).forEach((key) => {

      const img = new Image();
      img.src = this.toLoad[key];

      this.images[key] = {
        image: img,
        isLoaded: false,
      };

      img.onload = () => {
        this.images[key].isLoaded = true;
      };
    });
  }

  /** 
   * Helper Methode
   * - Du brauchst das passende Bild zu einem Item was man einsammeln kann?
   * - Dann nutze deinen ItemNamen um den richtigen frame zu ermitteln.
   * @param itemKey ItemName um collectible Bild zu ermitteln
   * */
  getCollectibleItemFrame(itemKey: InventoryUnion | EquipmentUnion): number {
    let frame: number;
    switch (itemKey) {
      case INVENTORY_BUSH:
        frame = 11;
        break;
      case INVENTORY_TREE:
        frame = 12;
        break;
      case INVENTORY_STONE:
        frame = 13;
        break;
      case EQUIPMENT_SWORD:
        frame = 0;
        break;
      case EQUIPMENT_ROD_PURPLE:
        frame = 1;
        break;
      case EQUIPMENT_ROD_RED:
        frame = 2;
        break;
      default:
        frame = 19;
        break;
    }
    return frame;
  }
}

// Create one instance for the whole app to use
export const resources = new Resources();
