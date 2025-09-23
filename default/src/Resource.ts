export interface ResourceOptions {
  hero: string;
  rodPurple: string;
  rodRed: string;
  shadow: string;
  exit: string;
  ground: string;
  sky: string;
  cave: string;
  caveGround: string;
  knight: string;
  textBox: string;
  fontWhite: string;
  portraits: string;
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
      hero: "./images/sprites/hero-sheet.png",
      shadow: "./images/sprites/shadow.png",
      knight: "./images/sprites/knight-sheet-1.png",

      // Startlevel Images
      ground: "./images/sprites/ground.png",
      sky: "./images/sprites/sky.png",

      // Cave Images
      cave: "./images/sprites/cave.png",
      caveGround: "./images/sprites/cave-ground.png",

      // FLOOR
      exit: "./images/sprites/exit.png",

      // HUD
      textBox: "./images/sprites/text-box.png",
      fontWhite: "./images/sprites/sprite-font-white.png",
      portraits: "./images/sprites/portraits-sheet.png",

      // Items
      rodPurple: "./images/sprites/rod-lila.png",
      rodRed: "./images/sprites/rod-rot.png",
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
        // console.log(`${key} loaded!`);
      };
    });
  }
}

// Create one instance for the whole app to use
export const resources = new Resources();
