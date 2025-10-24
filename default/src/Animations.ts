import { FrameIndexPattern } from "./FrameIndexPattern";

export type HeroAnimationKey =
  "walkLeft"
  | "walkDown"
  | "walkUp"
  | "walkRight"
  | "standLeft"
  | "standDown"
  | "standUp"
  | "standRight"
  | "pickUpDown"
// | "damageDown"
// | "damageRight"
// | "damageUp"
// | "damageLeft"

export type AttackAnimationKey =
  "attackDown"
  | "attackRight"
  | "attackUp"
  | "attackLeft"

export type DekoIdleKey = "dekoIdle"

export type AnimationUnion = HeroAnimationKey | AttackAnimationKey | DekoIdleKey

export class Animations<T extends AnimationUnion> {
  patterns: Record<T, FrameIndexPattern>;
  activeKey: T;

  constructor(patterns: Record<T, FrameIndexPattern>) {
    this.patterns = patterns;
    this.activeKey = Object.keys(this.patterns)[0] as T;
  }

  get frame() {
    return this.patterns[this.activeKey].frame;
  }

  play(key: T, startAtTime = 0) {
    // Already playing
    if (this.activeKey === key) {
      return;
    }

    // Switch to new pattern
    this.activeKey = key;
    this.patterns[this.activeKey].currentTime = startAtTime;
  }

  step(delta: number) {
    this.patterns[this.activeKey].step(delta);
  }

  // aller 5 sekunden
  static makeIdleFrames = (rootFrame = 0) => {

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
}