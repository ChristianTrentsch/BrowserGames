import { OutdoorLevel1 } from "../levels/OutdoorLevel1.js";
import { CaveLevel1 } from "../levels/CaveLevel1.js";
import { Vector2 } from "../Vector2.js";
import { gridCells } from "./grid.js";
// weitere Level hier importieren …

export type LevelId = "OutdoorLevel1" | "CaveLevel1";
export type LevelUnion =
    typeof OutdoorLevel1
    | typeof CaveLevel1;

export const levelRegistry: Record<string, LevelUnion> = {
    OutdoorLevel1,
    CaveLevel1,
    // "DungeonLevel2": DungeonLevel2, ...
};

export function getNewLevelInstance(levelId: LevelId, heroPosition: Vector2) {
    let newLevel;
    switch (levelId) {
        case "OutdoorLevel1":
            newLevel = new OutdoorLevel1({
                position: new Vector2(gridCells(0), gridCells(0)),
                heroPosition: heroPosition, // feste Startposition
            })
            break;

        case "CaveLevel1":
            newLevel = new CaveLevel1({
                position: new Vector2(gridCells(0), gridCells(0)),
                heroPosition: heroPosition, // feste Startposition
            })
            break;

        default:
            newLevel = new OutdoorLevel1({
                position: new Vector2(gridCells(0), gridCells(0)),
                heroPosition: heroPosition, // feste Startposition
            })
            break;
    }

    return newLevel;
}
