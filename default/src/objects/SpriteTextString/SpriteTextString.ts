import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Vector2 } from "../../Vector2.js";
import { Sprite } from "../../Sprite.js";
import { getCharacterFrame, getCharacterWidth } from "./spriteFontMap.js";
import { events, TEXTBOX_END } from "../../Events.js";
import { Main } from "../Main/Main.js";

export class SpriteTextString extends GameObject {

  words: {
    wordWidth: number,
    chars: {
      width: number;
      sprite: Sprite;
    }[]
  }[];
  showingIndex: number;
  backdrop: Sprite;
  portrait: Sprite;
  finalIndex: number;
  textSpeed: number;
  timeUntilNextShow: number;

  constructor(portraitFrame: number, string: string) {
    super(new Vector2(16, 96));

    console.log(`SpriteTextString LOADED`, this);

    // Draw on top layer
    this.drawLayer = "HUD";

    // Create an array of words (because it helps with line wrapping later)
    const content = string ?? "Default";
    this.words = content.split(" ").map((word) => {
      // We need to know how wide this word is
      let wordWidth = 0;

      // Break each word into single characters
      const chars = word.split("").map((char) => {
        // Measure each one
        const charWidth = getCharacterWidth(char);
        wordWidth += charWidth;

        // Also create a Sprite for each character in the word
        return {
          width: charWidth,
          sprite: new Sprite({
            position: new Vector2(0, 0),
            resource: resources.images.fontWhite,
            hFrames: 13,
            vFrames: 6,
            frame: getCharacterFrame(char),
          }),
        };
      });

      // Return a length and liste of characters per word
      return {
        wordWidth,
        chars,
      };
    });

    // Create background for text
    this.backdrop = new Sprite({
      position: new Vector2(0, 0),
      resource: resources.images.textBox,
      frameSize: new Vector2(256, 64),
    });

    // Create a portrait
    this.portrait = new Sprite({
      position: new Vector2(0, 0),
      resource: resources.images.portraits,
      hFrames: 4,
      frame: portraitFrame ?? 0,
    });

    // Typewriter
    this.showingIndex = 0;
    this.finalIndex = this.words.reduce(
      (acc, word) => acc + word.chars.length,
      0
    );
    this.textSpeed = 80;
    this.timeUntilNextShow = this.textSpeed;
  }

  step(delta: number, root: Main) {
    const input = root.input;
    if (input?.getActionJustPressed("Space")) {
      if (this.showingIndex < this.finalIndex) {
        // Skip
        this.showingIndex = this.finalIndex;
        return;
      }

      // Done with the textbox
      events.emit(TEXTBOX_END);
    }

    // Work on typewriter
    this.timeUntilNextShow -= delta;
    if (this.timeUntilNextShow <= 0) {
      // Increase amount of characters that are drawn
      this.showingIndex += 1;

      // Reset time counter for next character
      this.timeUntilNextShow = this.textSpeed;
    }
  }

  drawImage(ctx: CanvasRenderingContext2D, drawPosX: number, drawPosY: number) {
    // Draw backdrop first
    this.backdrop.drawImage(ctx, drawPosX, drawPosY);

    // Configuration options
    const PADDING_LEFT = 7;
    const PADDING_TOP = 5;
    const LINE_WIDTH_MAX = 240;
    const LINE_VERTICAL_HEIGHT = 14;

    // Initial position of cursor
    let cursorX = drawPosX + PADDING_LEFT;
    let cursorY = drawPosY + PADDING_TOP;
    let currentShowingIndex = 0;

    this.words.forEach((word) => {
      // Decide if we can fit next word on this line
      const spaceRemaining = drawPosX + LINE_WIDTH_MAX - cursorX;
      if (spaceRemaining < word.wordWidth) {
        cursorX = drawPosX + PADDING_LEFT;
        cursorY += LINE_VERTICAL_HEIGHT;
      }

      // loop up each char and take the width and the sprite to show char
      word.chars.forEach((char) => {
        if (currentShowingIndex > this.showingIndex) {
          return;
        }

        const { sprite, width } = char;

        const withCharOffset = cursorX - 5;
        sprite.draw(ctx, withCharOffset, cursorY);

        // Add width of the character we just printed to cursor pos
        cursorX += width;

        // Plus 1px between character
        cursorX += 1;

        // Uptick the index we are counting
        currentShowingIndex += 1;
      });

      // Move the cursor over
      cursorX += 3;
    });
  }
}
