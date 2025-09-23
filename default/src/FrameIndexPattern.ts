export class FrameIndexPattern {
  currentTime: number;
  duration: number;
  frames: { time: number; frame: number; }[];

  constructor(config: {
    duration: number;
    frames: { time: number; frame: number; }[];
  }) {
    this.currentTime = 0;
    this.frames = config.frames;
    this.duration = config.duration ?? 500;
  }

  get frame() {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const frame = this.frames[i]
      if (frame && this.currentTime >= frame.time) {
        return frame.frame;
      }
    }

    throw "Time is befor the first frame!";
  }

  step(delta: number) {
    this.currentTime += delta;
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
    }
  }
}
