export interface ResourceOptions {
  caveGround: string;
  caveSky: string;
  exit: string;
  hero: string;
  knight: string;
  nothing: string;
  outdoorBush: string;
  outdoorGround: string;
  outdoorHouse: string;
  outdoorSky: string;
  outdoorSquare: string;
  outdoorStone: string;
  outdoorSwamp: string;
  outdoorTree: string;
  outdoorWater: string;
  portraits: string;
  shadow: string;
  fontWhite: string;
  fontBlack: string;
  startGround: string;
  textBox: string;

  //** Inventory Stuff */
  inventoryItemFrame: string;
  treeResource: string;
  stoneResource: string;
  bushResource: string;

  //** Item/Equipment Stuff */
  equipmentItemFrame: string;
  equipmentActiveFrame: string;
  sword: string;
  rodPurple: string;
  rodRed: string;
  rodAttackPurple: string;
  rodAttackRed: string;
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

    // Everything we want to load
    this.toLoad = {
      // Player/Npc
      hero: "./images/sprites/new-hero-sheet.png",
      shadow: "./images/sprites/shadow.png",
      knight: "./images/sprites/knight-sheet-1.png",

      nothing: "./images/sprites/nothing.png",

      // Startlevel Images
      startGround: "./images/sprites/start-ground.png",

      // Outdoor Images
      outdoorBush: "./images/sprites/outdoor/outdoor-bush_new.png",
      outdoorGround: "./images/sprites/outdoor/outdoor-ground-big.png",
      outdoorHouse: "./images/sprites/outdoor/outdoor-house.png",
      outdoorSky: "./images/sprites/outdoor/outdoor-sky.png",
      outdoorSquare: "./images/sprites/outdoor/outdoor-square.png",
      outdoorStone: "./images/sprites/outdoor/outdoor-stone_new.png",
      outdoorSwamp: "./images/sprites/outdoor/outdoor-swamp.png",
      outdoorTree: "./images/sprites/outdoor/outdoor-tree_new.png",
      outdoorWater: "./images/sprites/outdoor/outdoor-water.png",

      // Cave Images
      caveGround: "./images/sprites/cave/cave-ground.png",
      caveSky: "./images/sprites/cave/cave-sky.png",

      // FLOOR
      exit: "./images/sprites/exit.png",

      // HUD
      textBox: "./images/sprites/text-box.png",
      fontWhite: "./images/sprites/sprite-font-white.png",
      fontBlack: "./images/sprites/sprite-font-black.png",
      portraits: "./images/sprites/portraits-sheet.png",

      //** Inventory Stuff */
      inventoryItemFrame: "./images/sprites/inventory_item_frame.png",
      treeResource: "./images/sprites/outdoor/tree_resource.png",
      stoneResource: "./images/sprites/outdoor/stone_resource.png",
      bushResource: "./images/sprites/outdoor/bush_resource.png",

      //** Item/Equipment Stuff */
      equipmentItemFrame: "./images/sprites/equipment_item_frame.png",
      equipmentActiveFrame: "./images/sprites/equipment_active_frame.png",
      sword: "./images/sprites/sword_experimental.png",
      rodPurple: "./images/sprites/rod-purple.png",
      rodRed: "./images/sprites/rod-red.png",
      rodAttackPurple: "./images/sprites/rod_purple_experimental.png",
      rodAttackRed: "./images/sprites/rod_red_experimental.png",
    };

    // A bucket to store all of our images
    // this.images = {};
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
}

// Create one instance for the whole app to use
export const resources = new Resources();
