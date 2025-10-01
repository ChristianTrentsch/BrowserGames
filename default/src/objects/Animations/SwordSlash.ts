import { GameObject } from "./../../GameObject.js";
import { Vector2 } from "./../../Vector2.js";
import { events } from "./../../Events.js";
import { LEFT, RIGHT, UP, DOWN } from "./../../Input.js";
import { Direction } from "../../types.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { WALK_LEFT, WALK_DOWN, WALK_UP, WALK_RIGHT, STAND_LEFT, STAND_DOWN, STAND_UP, STAND_RIGHT, PICK_UP_DOWN, ATTACK_WALK_DOWN, ATTACK_WALK_LEFT, ATTACK_WALK_RIGHT, ATTACK_WALK_UP } from "../Hero/heroAnimations.js";

export class SwordSlash extends GameObject {
    lifetime: number = 480; // lebt 250ms
    facingDirection: Direction;
    body: Sprite;

    // Array mit Start/End-Zeiten (Sekunden) für jeden Sound
    private static attackSlices: [number, number][] = [
        [0.2, 0.6],  // Slice 1
        [3.0, 3.4],  // Slice 2
        [5.6, 6.0],  // Slice 3
    ];

    // Merkt sich den Index für die nächste Attacke
    private static sliceIndex: number = 0;

    constructor(heroPosition: Vector2, facingDirection: Direction) {
        // Position abhängig von Hero + FacingDirection
        // const slashPos = heroPosition.toNeighbor(facing);
        // super(heroPosition);
        super(new Vector2(0, 0));
        this.facingDirection = facingDirection;

        this.drawLayer = "HUD";
        // console.log(resources.images.sword);


        // Sprite oder Animationszuweisung hier
        this.body = new Sprite({
            resource: resources.images.sword,
            position: new Vector2(-8, -8),
            frameSize: new Vector2(32, 32),
            hFrames: 6,
            vFrames: 4,
            frame: 1,
            animations: new Animations({
                walkLeft: new FrameIndexPattern(WALK_LEFT),
                walkDown: new FrameIndexPattern(WALK_DOWN),
                walkUp: new FrameIndexPattern(WALK_UP),
                walkRight: new FrameIndexPattern(WALK_RIGHT),
                standLeft: new FrameIndexPattern(STAND_LEFT),
                standDown: new FrameIndexPattern(STAND_DOWN),
                standUp: new FrameIndexPattern(STAND_UP),
                standRight: new FrameIndexPattern(STAND_RIGHT),
                pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
                attackWalkDown: new FrameIndexPattern(ATTACK_WALK_DOWN),
                attackWalkRight: new FrameIndexPattern(ATTACK_WALK_RIGHT),
                attackWalkUp: new FrameIndexPattern(ATTACK_WALK_UP),
                attackWalkLeft: new FrameIndexPattern(ATTACK_WALK_LEFT),
            }),
        });
        this.addChild(this.body);

        // Zufällig einen Slice auswählen
        const randomSlice = SwordSlash.attackSlices[
            Math.floor(Math.random() * SwordSlash.attackSlices.length)
        ];
        if (randomSlice) {
            this.playSoundSlice(randomSlice[0], randomSlice[1]);
        }
        
        // // Nächsten Slice aus Array holen
        // const slice = SwordSlash.attackSlices[SwordSlash.sliceIndex];
        // if (slice) {
        //     console.log(slice);
        //     this.playSoundSlice(slice[0], slice[1]);
        // }

        // // Index hochzählen + zurücksetzen wenn Ende erreicht
        // SwordSlash.sliceIndex = (SwordSlash.sliceIndex + 1) % SwordSlash.attackSlices.length;

        // Start-Animation abspielen
        if (this.body.animations) {
            switch (this.facingDirection) {
                case LEFT:
                    this.body.animations.play("attackWalkLeft");
                    break;
                case RIGHT:
                    this.body.animations.play("attackWalkRight");
                    break;
                case UP:
                    this.body.animations.play("attackWalkUp");
                    break;
                case DOWN:
                    this.body.animations.play("attackWalkDown");
                    break;
            }

            return;
        }
    }

    step(delta: number) {
        this.lifetime -= delta;

        // console.log("lifetime", this.lifetime);

        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    destroy() {
        // Cleanup
        super.destroy();
        // console.log("SwordSlash removed");
    }

    async playSoundSlice(startTime: number, endTime: number) {
        const response = await fetch("./sounds/items/sword_attack01.mp3");
        const arrayBuffer = await response.arrayBuffer();

        const audioCtx = new AudioContext();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        // Lautstärkeregler (GainNode) erstellen
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.3; // 0.0 = stumm, 1.0 = volle Lautstärke

        // Quelle → Gain → Lautsprecher
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // slice ab startTime, für (endTime - startTime) Sekunden abspielen
        source.start(0, startTime, endTime - startTime);
    }
}
