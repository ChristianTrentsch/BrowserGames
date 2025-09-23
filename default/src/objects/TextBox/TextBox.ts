import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";

export class TextBox extends GameObject {
  content: string;
  backdrop: Sprite;
  portrait: Sprite;
  constructor(portraitFrame: number) {
    super(new Vector2(32, 112));

    this.content =
      "Ich bin UWE und ich bin auch dabei! Ich bin UWE und ich bin auch dabei! Ich bin UWE und ich bin auch dabei!";
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
  }

  drawImage(ctx: CanvasRenderingContext2D, drawPosX: number, drawPosY: number) {
    // Draw backdrop first
    this.backdrop.drawImage(ctx, drawPosX, drawPosY);

    // Now draw text...
    ctx.font = "16px fontRetroGaming";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";

    const MAX_WIDTH = 250;
    const LINE_HEIGHT = 20;
    const PADDING_LEFT = 10;
    const PADDING_TOP = 12;

    let words = this.content.split(" ");
    let line = " ";

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metcrics = ctx.measureText(testLine);
      let testWidth = metcrics.width;

      // If the test line exceeds the maximum width, and it's not the first word...
      if (testWidth > MAX_WIDTH && n > 0) {
        ctx.fillText(line, drawPosX + PADDING_LEFT, drawPosY + PADDING_TOP);
        // Reset the line to start with the current word
        line = words[n] + " ";
        // Move cursor downwards
        drawPosY += LINE_HEIGHT;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, drawPosX + PADDING_LEFT, drawPosY + PADDING_TOP);
  }
}
