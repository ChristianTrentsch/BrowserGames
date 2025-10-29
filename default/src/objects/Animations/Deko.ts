import { Animations, DekoIdleKey } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { GameObject } from "../../GameObject.js";
import { BlockType, getNextText } from "../../helpers/levelPartsText.js";
import { ResourceOptions, resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";

export class Deko extends GameObject {

  frameIndexPattern: {
    duration: number;
    frames: {
      time: number;
      frame: number;
    }[];
  }
  frame: number = 0;
  frameSize: Vector2 = new Vector2(16, 16);
  hFrames: number = 1;
  vFrames: number = 1;
  contentType: BlockType | null = null;

  constructor(position: Vector2, imageKey: keyof ResourceOptions, animationDuration?: number) {

    super(position);

    this.frameIndexPattern = this.makeIdleFrames(0, animationDuration);
    this.drawLayer = null;

    let spritePosX = 0;
    let spritePosY = 0;

    switch (imageKey) {
      case "animWaterLeft":
      case "animWaterRight":
      case "animWaterMiddle":
        this.hFrames = 3;
        this.frameIndexPattern = this.makeWaterIdleFrames();
        break;
      case "animWater":
        this.hFrames = 8;
        this.drawLayer = "FLOOR";
        this.frameIndexPattern = this.makeWaterFrames();
        this.contentType = "Water";
        break;
      case "animLamp":
        spritePosY = -16; // optisch bisschen nach oben
        this.isSolid = true;
        this.frameSize = new Vector2(16, 32);
        this.hFrames = 4;
        this.vFrames = 1;
        this.frameIndexPattern = this.makeLampFrames(0, animationDuration);
        this.contentType = "Lamp";
        break;
      case "animBushSmall":
        this.hFrames = 3;
        this.frameIndexPattern = this.makeBushSmallFrames(0, animationDuration);
        break;
      case "animBush":
        this.hFrames = 6;
        break;
      case "animTorch":
        this.hFrames = 4;
        this.frameIndexPattern = this.makeTorchFrames();

        break;
    }

    this.addChild(new Sprite({
      position: new Vector2(spritePosX, spritePosY),
      resource: resources.images[imageKey],
      frameSize: this.frameSize,
      hFrames: this.hFrames,
      vFrames: this.vFrames,
      frame: this.frame,
      animations: new Animations<DekoIdleKey>({
        dekoIdle: new FrameIndexPattern(this.frameIndexPattern)
      }),
    }));
  }

  ready() { }

  getContent() {
    if (this.contentType) {
      return {
        portraitFrame: 0, // show first frame of portrait sprite
        // string: getRandomText("Tree"),
        string: getNextText(this.contentType),
      };
    }
  }

  makeIdleFrames = (rootFrame: number = 0, duration: number = 5000) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 200,
          frame: rootFrame + 1,
        },
        {
          time: 400,
          frame: rootFrame + 2,
        },
        {
          time: 600,
          frame: rootFrame + 3,
        },
        {
          time: 800,
          frame: rootFrame + 2,
        },
        {
          time: 1000,
          frame: rootFrame + 1,
        },
        {
          time: 1200,
          frame: rootFrame,
        },
      ],
    };
  };

  makeBushSmallFrames = (rootFrame: number = 0, duration: number = 5000) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 150,
          frame: rootFrame + 1,
        },
        {
          time: 300,
          frame: rootFrame + 2,
        },
        {
          time: 450,
          frame: rootFrame,
        },
      ],
    };
  };

  makeBushFrames = (rootFrame: number = 0, duration: number = 5000) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: 0,
        },
        {
          time: 120,
          frame: 1,
        },
        {
          time: 240,
          frame: 2,
        },
        {
          time: 360,
          frame: 1,
        },
        {
          time: 480,
          frame: 0,
        },
        {
          time: 600,
          frame: 3,
        },
        {
          time: 720,
          frame: 4,
        },
        {
          time: 840,
          frame: 3,
        },
        {
          time: 960,
          frame: 0,
        },
      ],
    };
  };

  makeWaterFrames = (rootFrame: number = 0, duration: number = 2400) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 300,
          frame: rootFrame + 1,
        },
        {
          time: 600,
          frame: rootFrame + 2,
        },
        {
          time: 900,
          frame: rootFrame + 3,
        },
        {
          time: 1200,
          frame: rootFrame + 4,
        },
        {
          time: 1500,
          frame: rootFrame + 5,
        },
        {
          time: 1800,
          frame: rootFrame + 6,
        },
        {
          time: 2100,
          frame: rootFrame + 7,
        },
      ],
    };
  };

  makeLampFrames = (rootFrame: number = 0, duration: number = 600) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 100,
          frame: rootFrame + 1,
        },
        {
          time: 200,
          frame: rootFrame + 2,
        },
        {
          time: 300,
          frame: rootFrame + 3,
        },
        {
          time: 400,
          frame: rootFrame + 2,
        },
        {
          time: 500,
          frame: rootFrame + 1,
        },
      ],
    };
  };

  makeTorchFrames = (rootFrame: number = 0, duration: number = 600) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 150,
          frame: rootFrame + 1,
        },
        {
          time: 300,
          frame: rootFrame + 2,
        },
        {
          time: 450,
          frame: rootFrame + 3,
        },
      ],
    };
  };

  makeWaterIdleFrames = (rootFrame: number = 0, duration: number = 3000) => {

    return {
      duration: duration,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
          time: 400,
          frame: rootFrame + 1,
        },
        {
          time: 800,
          frame: rootFrame + 2,
        },
      ],
    };
  };
}