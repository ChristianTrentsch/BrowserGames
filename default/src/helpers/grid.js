export const TILE_SIZE = 16;

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
