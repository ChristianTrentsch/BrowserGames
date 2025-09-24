import { OutdoorLevel1 } from "../levels/OutdoorLevel1.js";
import { CaveLevel1 } from "../levels/CaveLevel1.js";
// weitere Level hier importieren …

export const levelRegistry: Record<string, typeof OutdoorLevel1 | typeof CaveLevel1> = {
    OutdoorLevel1,
    CaveLevel1,
    // "DungeonLevel2": DungeonLevel2, ...
};
