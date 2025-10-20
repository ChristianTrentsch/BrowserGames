import { EventGainXp, events, HERO_CHANGE_EXP } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { resources } from "../../Resource.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { LEVEL_THRESHOLDS } from "../Hero/Hero.js";
import { getCharacterFrame, getCharacterWidth } from "../SpriteTextString/spriteFontMap.js";

export class Exp extends GameObject {
    exp: number;
    level: number;

    constructor() {
        super(new Vector2(0, 0));

        this.drawLayer = "HUD";

        // get Hero Data and set values
        const hero = SaveGame.loadHero();
        this.exp = hero?.exp ? hero.exp : 0;
        this.level = hero?.level ? hero.level : 0;

        this.renderExp();
    }

    ready() {
        events.on(HERO_CHANGE_EXP, this, (gainExp: EventGainXp) => {
            this.exp = gainExp.exp;
            this.level = gainExp.level;
            this.renderExp();
        });
    }

    renderExp() {
        // Remove old drawings
        this.children.forEach((child) => child.destroy());

        // Background
        this.addChild(
            new Sprite({
                resource: resources.images.expBackground,
                position: new Vector2(40, 140),
                frameSize: new Vector2(240, 24),
                frame: 0
            })
        );

        // this.addChild(
        //     new Sprite({
        //         resource: resources.images.levelBackground,
        //         position: new Vector2(-32, -3),
        //         frameSize: new Vector2(31, 31),
        //     })
        // );

        // this.addChild(
        //     new Sprite({
        //         position: new Vector2(-30, -1),
        //         resource: resources.images.portraits
        //     })
        // );

        if (this.level > 0) {
            let text = String(this.level);
            let xOffset = 38; // etwas nach rechts vom Item
            const yOffset = 136; // leicht nach oben

            text = "Lv:" + text;

            // Jede Ziffer zeichnen
            for (const char of text) {
                const charWidth = getCharacterWidth(char);

                const numberSprite = new Sprite({
                    position: new Vector2(xOffset, yOffset),
                    resource: resources.images.fontBlack, // Font-/Alphabet-SpriteSheet
                    hFrames: 13,
                    vFrames: 6,
                    frame: getCharacterFrame(char),
                });

                this.addChild(numberSprite);
                xOffset += charWidth + 1; // etwas Abstand zwischen den Ziffern
            }
        }

        // wieviel xp zum nächsten Level Up
        const nextLevelExp = LEVEL_THRESHOLDS[this.level];

        if (nextLevelExp) {

            // max Anzahl an Pixel
            const maxPixel = 234;

            // Prozentualer Fortschritt bis zum nächsten Level
            const progress = this.exp / nextLevelExp;

            // Begrenze auf 100 %
            const clampedProgress = Math.min(progress, 1);

            // Anzahl an Pixel die gezeichnet werden
            let showPixel = Math.floor(clampedProgress * maxPixel);

            // Draw exp Balken
            const frameSize = 1;
            for (let i = 0; i < showPixel; i++) {
                const baseX = i * frameSize;
                this.addChild(
                    new Sprite({
                        resource: resources.images.exp,
                        position: new Vector2(baseX + 43, 151),
                        frameSize: new Vector2(frameSize, 2),
                        hFrames: 240,
                        frame: i
                    })
                );
            }
        }
    }
}