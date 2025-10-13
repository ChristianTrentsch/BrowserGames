import { gridCells } from "../helpers/grid.js";
import { LevelId } from "../helpers/levelRegistry.js";
import { ResourceSaveData } from "../SaveGame.js";

interface GenerationOptions {
    seed?: number;
    levelId: LevelId;
    width: number;   // in Pixeln
    height: number;  // in Pixeln
    tileSize?: number;
    density?: {
        Tree: number;  // 0–1 = Anteil der Tiles, die Bäume bekommen könnten
        Bush: number;
        Stone: number;
    };
    pathZones?: { x1: number; x2: number; y1: number; y2: number }[]; // Bereiche ohne Resourcen
    border?: number;
}

/** deterministischer Zufall */
function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** prüft, ob eine Position innerhalb einer Pfad-Zone liegt */
function isInPath(x: number, y: number, paths: GenerationOptions["pathZones"]): boolean {
    if (!paths) return false;
    return paths.some(p => x >= p.x1 && x <= p.x2 && y >= p.y1 && y <= p.y2);
}

/** Hauptfunktion */
export function generateDefaultResources(options: GenerationOptions): ResourceSaveData[] {
    const {
        seed = 42,
        width,
        height,
        tileSize = 16,
        density = { Tree: 0.015, Bush: 0.007, Stone: 0.002 },
        pathZones = [],
        border = 32 // keine Resourcen am Rand
    } = options;

    const random = mulberry32(seed + options.levelId.length); // deterministisch pro Level
    const cols = Math.floor(width / tileSize);
    const rows = Math.floor(height / tileSize);
    const resources: ResourceSaveData[] = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = x * tileSize;
            const py = y * tileSize;

            // Überspringe Pfade
            if (isInPath(x, y, pathZones)) continue;

            // Überspringe Randbereich
            if (px < border || px > width - border - tileSize || py < border || py > height - border - tileSize) continue;

            const r = random();

            if (r < density.Tree) {
                const hp = getRandomHP(random, 3, 4, 0.1); // 10% Chance auf Ausreißer (selten mal einer dabei mit 2 hp)
                resources.push({
                    type: "Tree",
                    x: gridCells(x),
                    y: gridCells(y),
                    hp: hp
                });
            } else if (r < density.Tree + density.Bush) {
                const hp = getRandomHP(random, 2, 2, 0.1); // 10% Chance auf Ausreißer
                resources.push({
                    type: "Bush",
                    x: gridCells(x),
                    y: gridCells(y),
                    hp: hp
                });
            } else if (r < density.Tree + density.Bush + density.Stone) {
                const hp = getRandomHP(random, 3, 4, 0.1); // 10% Chance auf Ausreißer (selten mal einer dabei mit 2 hp)
                resources.push({
                    type: "Stone",
                    x: gridCells(x),
                    y: gridCells(y),
                    hp: hp
                });
            }
        }
    }

    return resources;
}

/** Kleine Hilfsfunktion für zufällige HP */
function getRandomHP(randFn: () => number, min: number, max: number, rareChance = 0.1): number {
  let hp = Math.floor(randFn() * (max - min + 1)) + min;

  // Mit kleiner Wahrscheinlichkeit Ausreißer erzeugen (etwas schwächer/stärker)
  if (randFn() < rareChance) {
    if (randFn() < 0.5) hp = Math.max(1, hp - 1); // schwächer
    else hp = hp + 1; // stärker
  }

  return hp;
}
