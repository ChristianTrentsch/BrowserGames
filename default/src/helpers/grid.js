export const TILE_SIZE = 16;

// 1. links/rechts
// 2. oben/unten
// gridCells(10), gridCells(3)
export const gridCells = (n) => {
  return n * TILE_SIZE;
};

export const isSpaceFree = (walls, x, y) => {
  // convert to string
  const str = `${x},${y}`;

  // check if wall is present
  const isWallPresent = walls.has(str);

  return !isWallPresent;
};
