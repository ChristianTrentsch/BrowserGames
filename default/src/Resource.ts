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

  // Resources
  bush: string;
  tree: string;
  stone: string;

  square: string;

  // Level - Outdoor
  outdoorGround: string;
  outdoorHouse: string;
  outdoorSky: string;
  outdoorSwamp: string;
  outdoorWater: string;

  // Level - Cave
  caveGround: string;
  desertGround: string;
  caveSky: string;

  // Inventory
  inventoryItemFrame: string;

  // Equipment 
  equipment: string;

  // Collectible
  collectible: string;

  deko16x32: string;

  // exp
  exp: string;
  expBackground: string;
  levelBackground: string;

  // Animations
  sword: string;
  rodRed: string;
  rodPurple: string;
  animBush: string;
  animBushSmall: string;
  animWater: string;
  animLamp: string;
};

export interface ResourceImageOptions {
  image: HTMLImageElement;
  isLoaded: boolean;
};

class Resources {

  toLoad: ResourceOptions;
  images: { [K in keyof ResourceOptions]: ResourceImageOptions }

  constructor() {
    // console.log(`Resources LOADED`, this);

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
      fontBlack: "./images/sprites/textbox/font_white_black_border.png",
      portraits: "./images/sprites/textbox/portraits.png",

      // Resources
      bush: "./images/sprites/resources/bush.png",
      tree: "./images/sprites/resources/tree.png",
      stone: "./images/sprites/resources/stone.png",

      square: "./images/sprites/level/outdoor/square.png",
      
      // Level - Outdoor
      outdoorGround: "./images/sprites/level/outdoor/ground_01.png",
      outdoorHouse: "./images/sprites/level/outdoor/house.png",
      outdoorSky: "./images/sprites/level/outdoor/sky.png",
      outdoorSwamp: "./images/sprites/level/outdoor/swamp.png",
      outdoorWater: "./images/sprites/level/outdoor/water.png",

      // Level - Cave
      caveGround: "./images/sprites/level/cave/ground_00.png",
      desertGround: "./images/sprites/level/cave/desert_ground_01.png",
      caveSky: "./images/sprites/level/cave/sky.png",

      // Inventory
      inventoryItemFrame: "./images/sprites/inventory/item_frame.png",

      // Equipment 
      equipment: "./images/sprites/equipment/equipment_01.png",

      // Collectibles
      collectible: "./images/sprites/collectible/collectible_00.png",

      deko16x32: "./images/sprites/deko_16x32.png",

      // Weapon
      sword: "./images/sprites/animation/sword.png",
      rodPurple: "./images/sprites/animation/rod_purple.png",
      rodRed: "./images/sprites/animation/rod_red.png",
      animBushSmall: "./images/sprites/animation/deko_bush_00.png",
      animBush: "./images/sprites/animation/deko_bush_01.png",
      animWater: "./images/sprites/animation/water.png",
      animLamp: "./images/sprites/animation/lamp.png",

      // exp
      exp: "./images/sprites/exp.png",
      expBackground: "./images/sprites/exp_background.png",
      levelBackground: "./images/sprites/level_background.png",
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
}

// Create one instance for the whole app to use
export const resources = new Resources();
