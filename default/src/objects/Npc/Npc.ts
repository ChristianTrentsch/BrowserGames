import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { storyFlags, StoryFlagsParts } from "../../StoryFlags.js";

export class Npc extends GameObject {

  portraitFrame: number;
  content: {
    string: string;
    requires?: StoryFlagsParts[];
    bypass?: StoryFlagsParts[];
    storyFlag?: StoryFlagsParts;
  }[];

  constructor(
    x: number,
    y: number,
    content: {
      string: string,
      requires?: StoryFlagsParts[],
      bypass?: StoryFlagsParts[],
      storyFlag?: StoryFlagsParts
    }[],
    portraitFrame: number = 1,
  ) {
    super(new Vector2(x, y));

    // npc block path as solid object
    this.isSolid = true;

    // Get individual Content
    this.content = content;

    // Show individual Portrait
    this.portraitFrame = portraitFrame;

    // Shadow under feet
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -18),
    });
    this.addChild(shadow);

    // Body of Npc
    const body = new Sprite({
      resource: resources.images.knight,
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -19),
      hFrames: 2,
      vFrames: 1,
      frame: 1,
    });
    this.addChild(body);
  }

  getContent(): {
    portraitFrame: number;
    string: string;
    storyFlag: StoryFlagsParts | null
  } | null {

    // search for a story scenario that matches
    const match = storyFlags.getRelevantScenario(this.content)
    if (!match) {
      console.warn("Npc, no storyflags found in list!", this.content);
      return null;
    }

    return {
      portraitFrame: this.portraitFrame,
      string: match.string,
      storyFlag: match.storyFlag ?? null
    };
  }
}
