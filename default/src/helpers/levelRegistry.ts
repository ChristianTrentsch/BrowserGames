import { OutdoorLevel1 } from "../levels/OutdoorLevel1.js";
import { CaveLevel1 } from "../levels/CaveLevel1.js";
import { StartLevel } from "../levels/StartLevel.js";
// weitere Level hier importieren …

export type LevelId = "OutdoorLevel1" | "CaveLevel1" | "StartLevel";

export const levelRegistry: Record<string, typeof OutdoorLevel1 | typeof CaveLevel1> = {
    OutdoorLevel1,
    CaveLevel1,
    StartLevel
    // "DungeonLevel2": DungeonLevel2, ...
};
