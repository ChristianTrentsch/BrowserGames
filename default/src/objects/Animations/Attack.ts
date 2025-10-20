import { GameObject } from "../../GameObject.js";
import { Vector2 } from "../../Vector2.js";
import { LEFT, RIGHT, UP, DOWN } from "../../Input.js";
import { Direction } from "../../types.js";
import { Sprite } from "../../Sprite.js";
import { resources } from "../../Resource.js";
import { Animations, AttackAnimationKey } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { ATTACK_DOWN, ATTACK_LEFT, ATTACK_RIGHT, ATTACK_UP } from "../Hero/heroAnimations.js";
import { SaveGame } from "../../SaveGame.js";
import { EquipmentUnion } from "../Equipment/Equipment.js";

export class Attack extends GameObject {
    lifetime: number = 400; // lebt 250ms
    facingDirection: Direction;
    body: Sprite<AttackAnimationKey>;

    // Array mit Start/End-Zeiten (Sekunden) für jeden Sound
    private static attackSlices: [number, number][] = [
        [0.2, 0.6],  // Slice 1
        [3.0, 3.4],  // Slice 2
        [5.6, 6.0],  // Slice 3
    ];

    // Merkt sich den Index für die nächste Attacke
    private static sliceIndex: number = 0;

    constructor(facingDirection: Direction, equipName: EquipmentUnion = "sword") {
        // Position abhängig von Hero + FacingDirection
        // const slashPos = heroPosition.toNeighbor(facing);
        // super(heroPosition);
        super(new Vector2(0, 0));
        this.facingDirection = facingDirection;

        this.drawLayer = "HUD";

        // Sprite oder Animationszuweisung hier
        this.body = new Sprite({
            resource: resources.images[equipName],
            position: new Vector2(-8, -8),
            frameSize: new Vector2(32, 32),
            hFrames: 6,
            vFrames: 4,
            frame: 1,
            animations: new Animations<AttackAnimationKey>({
                attackDown: new FrameIndexPattern(ATTACK_DOWN),
                attackRight: new FrameIndexPattern(ATTACK_RIGHT),
                attackUp: new FrameIndexPattern(ATTACK_UP),
                attackLeft: new FrameIndexPattern(ATTACK_LEFT),
            }),
        });
        this.addChild(this.body);

        // // Zufällig einen Slice auswählen
        // const randomSlice = Attack.attackSlices[
        //     Math.floor(Math.random() * (Attack.attackSlices.length - 1))
        // ];

        // // Check if sound is on
        // if (randomSlice && SaveGame.loadSound() === "on") {
        //     this.playSoundSlice(randomSlice[0], randomSlice[1]);
        // }

        // Nächsten Slice aus Array holen
        const slice = Attack.attackSlices[Attack.sliceIndex];
        if (slice && SaveGame.loadSound() === "on") {
            this.playSoundSlice(slice[0], slice[1]);
        }

        // Index hochzählen + zurücksetzen wenn Ende erreicht
        Attack.sliceIndex = (Attack.sliceIndex + 1) % Attack.attackSlices.length;

        // Start-Animation abspielen
        if (this.body.animations) {
            switch (this.facingDirection) {
                case LEFT:
                    this.body.animations.play("attackLeft");
                    break;
                case RIGHT:
                    this.body.animations.play("attackRight");
                    break;
                case UP:
                    this.body.animations.play("attackUp");
                    break;
                case DOWN:
                    this.body.animations.play("attackDown");
                    break;
            }

            return;
        }
    }

    step(delta: number) {
        this.lifetime -= delta;

        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    destroy() {
        // Cleanup
        super.destroy();
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
        gainNode.gain.value = 0.2; // 0.0 = stumm, 1.0 = volle Lautstärke

        // Quelle → Gain → Lautsprecher
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // slice ab startTime, für (endTime - startTime) Sekunden abspielen
        source.start(0, startTime, endTime - startTime);
    }
}
