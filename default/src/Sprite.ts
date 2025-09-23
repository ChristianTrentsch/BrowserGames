import { Vector2 } from "./Vector2.js";
import { GameObject } from "./GameObject.js";
import { Animations } from "./Animations.js";
import { ResourceImageOptions } from "./Resource.js";

export class Sprite extends GameObject {

  resource: ResourceImageOptions;
  position: Vector2;
  frameSize: Vector2;
  hFrames: number;
  vFrames: number;
  frame: number;
  frameMap: Map<number, Vector2>;
  scale: number;
  animations: Animations | null;

  constructor({
    resource,
    position,
    frameSize,
    hFrames,
    vFrames,
    frame,
    scale,
    animations,
  }: {
    resource: ResourceImageOptions;   // image we want to use
    position: Vector2;                // where to draw the sprite
    frameSize?: Vector2;              // size of each frame
    hFrames?: number;                 // how is the sprite arranged horizontally
    vFrames?: number;                 // how is the sprite arranged vertically
    frame?: number;                   // which frame to show
    scale?: number;                   // how large to draw the sprite
    animations?: Animations | null;   // animation pattern to use
  }) {

    super(position);

    this.resource = resource;
    this.position = position ?? new Vector2(0, 0);
    this.frameSize = frameSize ?? new Vector2(16, 16);
    this.hFrames = hFrames ?? 1;
    this.vFrames = vFrames ?? 1;
    this.frame = frame ?? 0;
    this.frameMap = new Map();
    this.scale = scale ?? 1;
    this.animations = animations ?? null;

    this.buildFrameMap();
  }

  buildFrameMap() {
    let frameCount = 0;
    for (let v = 0; v < this.vFrames; v++) {
      for (let h = 0; h < this.hFrames; h++) {
        this.frameMap.set(
          frameCount,
          new Vector2(this.frameSize.x * h, this.frameSize.y * v)
        );
        frameCount++;
      }
    }
  }

  step(delta: number) {
    if (!this.animations) {
      return;
    }

    this.animations.step(delta);
    this.frame = this.animations.frame;
  }

  drawImage(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (!this.resource.isLoaded) {
      return;
    }

    // Find the correct Sprite
    let frameCoordX = 0;
    let frameCoordY = 0;
    const frame = this.frameMap.get(this.frame);
    if (frame) {
      frameCoordX = frame.x;
      frameCoordY = frame.y;
    }

    ctx.drawImage(
      this.resource.image, // Image
      frameCoordX, // X-Coordinate of the frame
      frameCoordY, // Y-Coordinate of the frame
      this.frameSize.x, // Width of the frame
      this.frameSize.y, // Height of the frame
      x, // X-Coordinate on the canvas
      y, // Y-Coordinate on the canvas
      this.frameSize.x * this.scale, // Width on the canvas
      this.frameSize.y * this.scale // Height on the canvas
    );
  }
}
