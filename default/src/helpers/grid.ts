export const TILE_SIZE = 16;

// 1. links/rechts
// 2. oben/unten
// gridCells(10), gridCells(3)
export const gridCells = (n: number) => {
  return n * TILE_SIZE;
};

export const isSpaceFree = (walls: Set<string>, x: number, y: number) => {
  // convert to string
  const str = `${x},${y}`;

  // check if wall is present
  const isWallPresent = walls.has(str);

  return !isWallPresent;
};
