import { Animations, DekoIdleKey } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import { GameObject } from "../../../GameObject.js";
import { gridCells } from "../../../helpers/grid.js";
import { ResourceOptions, resources } from "../../../Resource.js";
import { Sprite } from "../../../Sprite.js";
import { Vector2 } from "../../../Vector2.js";

export const DEKO_IDLE = Animations.makeIdleFrames(0);

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

    let frameIndexPattern = DEKO_IDLE;
    if (imageKey === "animWater") {
      frameIndexPattern = Animations.makeWaterFrames(0)
    }

    if (imageKey === "animLamp") {
      frameIndexPattern = this.makeLampFrames(0)
    }

    if (imageKey === "animBushSmall") {
      frameIndexPattern = this.makeStandardFrames(0)
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

  makeStandardFrames = (rootFrame = 0) => {

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