const makeStandingFrames = (rootFrame = 0) => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame,
      },
    ],
  };
};

const makeWalkingFrames = (rootFrame = 0) => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1,
      },
      {
        time: 100,
        frame: rootFrame,
      },
      {
        time: 200,
        frame: rootFrame + 1,
      },
      {
        time: 300,
        frame: rootFrame + 2,
      },
    ],
  };
};

const makeAttackFrames = (rootFrame = 0) => {
  return {
    duration: 480,
    frames: [
      { time: 0, frame: rootFrame },      // Start neutral
      { time: 120, frame: rootFrame + 1 },  // Ausholen
      { time: 80, frame: rootFrame + 2 },  // Schlag (Impact!)
      { time: 60, frame: rootFrame + 3 },  // kurz zurück
      { time: 120, frame: rootFrame + 4 },  // kurz zurück
      { time: 100, frame: rootFrame + 5 },  // kurz zurück
    ],
  };
};

const makeDamageFrames = (rootFrame = 0) => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1,
      },
      {
        time: 100,
        frame: rootFrame,
      },
      {
        time: 200,
        frame: rootFrame + 1,
      },
      {
        time: 300,
        frame: rootFrame + 2,
      },
    ],
  };
};

export const STAND_DOWN = makeStandingFrames(1);
export const STAND_RIGHT = makeStandingFrames(4);
export const STAND_UP = makeStandingFrames(7);
export const STAND_LEFT = makeStandingFrames(10);

export const WALK_DOWN = makeWalkingFrames(0);
export const WALK_RIGHT = makeWalkingFrames(3);
export const WALK_UP = makeWalkingFrames(6);
export const WALK_LEFT = makeWalkingFrames(9);

export const DAMAGE_DOWN = makeDamageFrames(12);
export const DAMAGE_RIGHT = makeDamageFrames(15);
export const DAMAGE_UP = makeDamageFrames(18);
export const DAMAGE_LEFT = makeDamageFrames(21);

export const ATTACK_WALK_DOWN = makeAttackFrames(0);
export const ATTACK_WALK_RIGHT = makeAttackFrames(6);
export const ATTACK_WALK_UP = makeAttackFrames(12);
export const ATTACK_WALK_LEFT = makeAttackFrames(18);

export const PICK_UP_DOWN = {
  duration: 400,
  frames: [
    {
      time: 0,
      frame: 12,
    },
  ],
};
