import { GameObject } from "../../GameObject.js";
import { gridCells } from "../../helpers/grid.js";
import { LevelId } from "../../helpers/levelRegistry.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { storyFlags } from "../../StoryFlags.js";
import { Vector2 } from "../../Vector2.js";

/**
 * Base Level class.
 * Make it abstract and force subclasses to provide a `background: Sprite`.
 */
export abstract class Level extends GameObject {
  // Subclasses MUST provide a Sprite for the background
  abstract background: Sprite;
  abstract walls: Set<string>;
  abstract levelId: LevelId; // jede Map muss eindeutige ID haben
  abstract defaultHeroPosition: Vector2;

  backgroundSound?: HTMLAudioElement;
  noRessourceZones: { x1: number, x2: number, y1: number, y2: number }[];

  constructor(position: Vector2, backgroundSoundSrc?: string, volume: number = 0.5) {
    super(position);

    if (backgroundSoundSrc) {
      this.backgroundSound = new Audio(backgroundSoundSrc);
      this.backgroundSound.loop = true; // Endlosschleife
      this.backgroundSound.volume = volume; // Lautstärke setzen (0.0 - 1.0)
    }

    this.noRessourceZones = [];
  }

  protected addChildrenGroup(
    name: string,
    baseX: number,
    baseY: number,
    objects: GameObject[],
    noRessourceZones: { x1: number, x2: number, y1: number, y2: number }[] = [],
  ) {
    console.groupCollapsed(`Adding group: ${name}`);

    // Umrechnung von Pixeln auf Grid-Koordinaten
    const baseGridX = Math.floor(baseX / gridCells(1));
    const baseGridY = Math.floor(baseY / gridCells(1));

    objects.forEach(obj => {
      // neue Position relativ zum baseX/baseY
      obj.position.x += baseX;
      obj.position.y += baseY;

      this.addChild(obj);
      console.log(`Added ${obj.constructor.name} at (${obj.position.x}, ${obj.position.y})`);
    });

    // Übernehme No-Resource-Zonen in Level-Koordinaten
    const adjustedZones = noRessourceZones.map(zone => ({
      x1: zone.x1 + baseGridX,
      y1: zone.y1 + baseGridY,
      x2: zone.x2 + baseGridX,
      y2: zone.y2 + baseGridY,
    }));

    if (!this.noRessourceZones) {
      this.noRessourceZones = [];
    }

    this.noRessourceZones.push(...adjustedZones);

    console.groupEnd();
  }

  protected checkGameProgress(){
    //** --- Check if Quest "rodPurple" is finished --- */
    if (SaveGame.isInEquipment("rodPurple")) {
      // Festlegen das Quest bereits abgeschlossen
      storyFlags.add("STORY_01_PART_01");
    }

    //** --- Check if Quest "rodRed" is finished --- */
    if (SaveGame.isInEquipment("rodRed")) {
      // Festlegen das Quest bereits abgeschlossen
      storyFlags.add("STORY_02_PART_01");
    }
  }

  /** Initialisiert den Hintergrundsound basierend auf SaveGame */
  protected initBackgroundSound() {
    const sound = SaveGame.loadSound();
    if (sound === "on") {
      this.playBackgroundSound();
      // this.playBackgroundSoundFadeIn();
    } else {
      this.stopBackgroundSound();
      // this.stopBackgroundSoundFadeOut();
    }
  }

  protected playBackgroundSoundFadeIn(duration: number = 1000) {
    if (this.backgroundSound) {
      this.backgroundSound.volume = 0; // leise starten
      this.backgroundSound.play().catch(err => console.warn(err));

      let step = 0.05; // Lautstärke-Schritte
      let interval = duration / (1 / step);

      let fade = setInterval(() => {
        if (this.backgroundSound!.volume < 1) {
          this.backgroundSound!.volume = Math.min(1, this.backgroundSound!.volume + step);
        } else {
          clearInterval(fade);
        }
      }, interval);
    }
  }

  protected stopBackgroundSoundFadeOut(duration: number = 1000) {
    if (this.backgroundSound) {
      let step = 0.05; // Lautstärke-Schritte
      let interval = duration / (1 / step);

      let fade = setInterval(() => {
        if (this.backgroundSound!.volume > 0) {
          this.backgroundSound!.volume = Math.max(0, this.backgroundSound!.volume - step);
        } else {
          clearInterval(fade);
          this.backgroundSound!.pause();
          this.backgroundSound!.currentTime = 0;
        }
      }, interval);
    }
  }

  protected playBackgroundSound() {
    if (this.backgroundSound) {
      this.backgroundSound.play().catch(err => console.warn("Sound konnte nicht abgespielt werden:", err));
    }
  }

  protected stopBackgroundSound() {
    if (this.backgroundSound) {
      this.backgroundSound.pause();
      // this.backgroundSound.currentTime = 0;
    }
  }

  /**
   * Erzeugt ein Array mit Koordinatenstrings für Spielfeldbegrenzungen.
   * - direction: "top", "bottom", "left", "right"
   */
  protected generateWall(
    start: Vector2,
    end: Vector2,
    step: number,
    direction: "top" | "bottom" | "left" | "right"
  ): string[] {
    const coords: string[] = [];

    switch (direction) {
      case "top":
      case "bottom":
        for (let x = start.x; x <= end.x; x += step) {
          coords.push(`${x},${start.y}`);
        }
        break;

      case "left":
      case "right":
        for (let y = start.y; y <= end.y; y += step) {
          coords.push(`${start.x},${y}`);
        }
        break;
    }

    return coords;
  }
}
