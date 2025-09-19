import { Vector2 } from "./Vector2.js";
import { GameObject } from "./GameObject.js";

export class Sprite extends GameObject {
  constructor({
    resource, // image we want to use
    frameSize, // size of each frame
    hFrames, // how is the sprite arranged horizontally
    vFrames, // how is the sprite arranged vertically
    frame, // which frame to show
    scale, // how large to draw the sprite
    position, // where to draw the sprite
    animations, // animation pattern to use
  }) {
    super({});

    this.resource = resource;
    this.frameSize = frameSize ?? new Vector2(16, 16);
    this.hFrames = hFrames ?? 1;
    this.vFrames = vFrames ?? 1;
    this.frame = frame ?? 0;
    this.frameMap = new Map();
    this.scale = scale ?? 1;
    this.position = position ?? new Vector2(0, 0);
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

  step(delta) {
    if (!this.animations) {
      return;
    }

    this.animations.step(delta);
    this.frame = this.animations.frame;
  }

  drawImage(ctx, x, y) {
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
