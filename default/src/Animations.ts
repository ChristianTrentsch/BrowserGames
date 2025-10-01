import { FrameIndexPattern } from "./FrameIndexPattern";

export type AnimationKey = "walkLeft"
  | "walkDown"
  | "walkUp"
  | "walkRight"
  | "standLeft"
  | "standDown"
  | "standUp"
  | "standRight"
  | "pickUpDown"
  | "damageDown"
  | "damageRight"
  | "damageUp"
  | "damageLeft"
  | "attackWalkDown"
  | "attackWalkRight"
  | "attackWalkUp"
  | "attackWalkLeft"
  | "attackStandDown"
  | "attackStandRight"
  | "attackStandUp"
  | "attackStandLeft"

export class Animations {
  patterns: Record<AnimationKey, FrameIndexPattern>;
  activeKey: AnimationKey;

  constructor(patterns: Record<AnimationKey, FrameIndexPattern>) {
    this.patterns = patterns;
    this.activeKey = Object.keys(this.patterns)[0] as AnimationKey;
  }

  get frame() {
    return this.patterns[this.activeKey].frame;
  }

  play(key: AnimationKey, startAtTime = 0) {
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
}