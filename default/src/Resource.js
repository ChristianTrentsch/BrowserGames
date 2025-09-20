class Resources {
  constructor() {
    // Everything we want to load
    this.toLoad = {
      hero: "./images/sprites/hero-sheet.png",
      rod: "./images/sprites/rod.png",
      shadow: "./images/sprites/shadow.png",
      exit: "./images/sprites/exit.png",

      // Startlevel Images
      ground: "./images/sprites/ground.png",
      sky: "./images/sprites/sky.png",

      // Cave Images
      cave: "./images/sprites/cave.png",
      caveGround: "./images/sprites/cave-ground.png",
    };

    // A bucket to store all of our images
    this.images = {};

    // Load all of the images
    Object.keys(this.toLoad).forEach((key) => {
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
