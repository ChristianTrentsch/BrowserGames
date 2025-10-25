import { Animations, DekoIdleKey } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import { GameObject } from "../../../GameObject.js";
import { ResourceOptions, resources } from "../../../Resource.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";

export class Deko extends GameObject {

  constructor(
    position: Vector2,
    imageKey: keyof ResourceOptions,
    frame: number = 0,
    hFrames: number = 1,
    vFrames: number = 1,
    frameSize: Vector2 = new Vector2(16, 16),
  ) {
    super(position);

    this.drawLayer = "FLOOR";
    let frameIndexPattern = this.makeIdleFrames();

    switch (imageKey) {
      case "animWater":
        frameIndexPattern = this.makeWaterFrames();
        break;
      case "animLamp":
        frameIndexPattern = this.makeLampFrames();
        break;
      case "animBushSmall":
        frameIndexPattern = this.makeBushSmallFrames();
        break;
    }

    this.addChild(new Sprite({
      position: new Vector2(0, 0),
      resource: resources.images[imageKey],
      frameSize: frameSize,
      hFrames: hFrames,
      vFrames: vFrames,
      frame: frame,
      animations: new Animations<DekoIdleKey>({
        dekoIdle: new FrameIndexPattern(frameIndexPattern)
      }),
    }));
  }

  ready() { }

  makeIdleFrames = (rootFrame = 0) => {

    return {
      duration: 5000,
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

  makeBushSmallFrames = (rootFrame = 0) => {

    return {
      duration: 2000,
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

  makeWaterFrames = (rootFrame = 0) => {

    return {
      duration: 2400,
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

  makeLampFrames = (rootFrame = 0) => {

    return {
      duration: 600,
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
}