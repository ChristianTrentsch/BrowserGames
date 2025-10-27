import { CHANGE_LEVEL, events, HERO_SHOW_MAP } from "../../Events.js";
import { GameObject } from "../../GameObject.js";
import { gridCells } from "../../helpers/grid.js";
import { LevelId } from "../../helpers/levelRegistry.js";
import { resources } from "../../Resource.js";
import { SaveGame } from "../../SaveGame.js";
import { Sprite } from "../../Sprite.js";
import { Vector2 } from "../../Vector2.js";
import { Hero } from "../Hero/Hero.js";
import { Level } from "../Level/Level.js";
import { Main } from "../Main/Main.js";

export class LevelMap extends GameObject {

    private isVisible: boolean = false; // Karte aktuell sichtbar?
    private mapSprite?: Sprite | null;
    private heroMarker?: Sprite | null;
    private readonly mapScale = 0.14; // Maßstab für Karte und Positionen

    private levelId: LevelId | null;
    private mapShell: GameObject | null = null;

    constructor() {
        super(new Vector2(-52, 0));

        this.levelId = SaveGame.loadLevel();
    }

    ready(): void {

        events.on(CHANGE_LEVEL, this, (newLevelInstance: Level) => {
            // Toggle-Zustand zurücksetzen
            this.isVisible = false;
            this.levelId = newLevelInstance.levelId;
            this.hideMap();
        });

        events.on(HERO_SHOW_MAP, this, (hero: Hero) => {
            // Toggle-Zustand ändern
            this.isVisible = !this.isVisible;

            if (this.isVisible) {
                this.showMap(hero.position);
            } else {
                this.hideMap();
            }
        })
    }

    step(delta: number, root: Main): void {
        // Wenn Karte sichtbar ist, Marker-Position aktualisieren
        if (this.isVisible && this.heroMarker) {
            if (root.level) {
                const hero = root.level.children.find(child => child instanceof Hero)
                if (hero) {
                    this.heroMarker.position.x = (hero.position.x * this.mapScale) - (32 * this.mapScale);
                    this.heroMarker.position.y = (hero.position.y * this.mapScale) - (32 * this.mapScale);
                }
            }
        }
    }

    showMap(heroPosition: Vector2) {

        // Bild auswählen passend zum Level
        let image = resources.images.outdoorGround;
        switch (this.levelId) {
            case "CaveLevel1":
                image = resources.images.desertGround;
                break;
        }

        this.mapShell = new GameObject(heroPosition);

        // Karte anzeigen
        this.mapSprite = new Sprite({
            position: new Vector2(0, 0),
            resource: image,
            frameSize: new Vector2(1600, 800),
            scale: this.mapScale,
        });
        this.mapShell.addChild(this.mapSprite);

        // Position für Hero Marker
        const scaledHeroPos = new Vector2(
            heroPosition.x * this.mapScale,
            heroPosition.y * this.mapScale
        );

        // Marker für den Hero
        this.heroMarker = new Sprite({
            resource: resources.images.mapMarker,
            position: scaledHeroPos,
            scale: this.mapScale * 5,
        });
        this.mapShell.addChild(this.heroMarker);

        this.addChild(this.mapShell);
    }

    hideMap() {
        if (this.mapSprite) {
            this.removeChild(this.mapSprite);
            this.mapSprite = null;
        }

        if (this.heroMarker) {
            this.removeChild(this.heroMarker);
            this.heroMarker = null;
        }

        if (this.mapShell) {
            this.removeChild(this.mapShell);
            this.mapShell = null;
        }
    }
}