export const STORYFLAGS = [
    "STORY_01_PART_01",
    "STORY_01_PART_02",
    "STORY_01_PART_03",
    "STORY_02_PART_01",
    "STORY_02_PART_02",
    "STORY_02_PART_03"
] as const;
export type StoryFlagsParts = typeof STORYFLAGS[number];

class StoryFlags {
    flags: Map<StoryFlagsParts, boolean>;

    constructor() {
        this.flags = new Map();
    }

    add(flag: StoryFlagsParts) {
        this.flags.set(flag, true);
    }

    getRelevantScenario(
        scenarios: {
            string: string,
            requires?: StoryFlagsParts[],
            bypass?: StoryFlagsParts[],
            storyFlag?: StoryFlagsParts
        }[]
    ) {

        return scenarios.find(scenario => {

            // Disqualify when any "bypass" flags are present
            // - check first to return early
            const byPassFlags = scenario.bypass ?? [];
            for (let i = 0; i < byPassFlags.length; i++) {
                const foundFlag = byPassFlags[i];
                if (foundFlag && this.flags.has(foundFlag)) {
                    return false;
                }
            }

            // Disqualify if we find a missing "requires" flag
            const requiresFlags = scenario.requires ?? [];
            for (let i = 0; i < requiresFlags.length; i++) {
                const foundFlag = requiresFlags[i];
                if (foundFlag && !this.flags.has(foundFlag)) {
                    return false;
                }
            }

            // If we made it this far, this scenario is relevant
            return true;
        })
    }
}

export const storyFlags = new StoryFlags();