// const TILE_TYPES = {
//   "#": "wall",
//   "T": "tree",
//   "W": "water",
//   "S": "stone",
//   "H": "house",
//   "B": "barrier",
// };

// const map = [
//   "###############",
//   "#####.......T##",
//   "#.T...BB......#",
//   "#.BB.......TH.#",
//   "#.BB.WWWW.....#",
//   "#.........SSS.#",
//   "###############",
// ];

// const walls = new Set();
// const objects = [];

// map.forEach((row, y) => {
//     row.split("").forEach((cell, x) => {
//       console.log(x, y, cell);
//     if (cell !== ".") {
//       const type = TILE_TYPES[cell] || "unknown";
//       const position = { x: x * TILE_SIZE, y: y * TILE_SIZE };

//       // Alles als Barriere speichern
//       walls.add(`${position.x},${position.y}`);

//       // Wenn du Objekte brauchst (z.B. Bäume rendern)
//       objects.push({ type, ...position });
//     }
//   });
// });

// console.log(walls);
// console.log(objects);

// const walls = new Set();
// World Barriers - RIGHT
// walls.add("240,32");
// walls.add("256,48");
// walls.add("256,64");
// walls.add("256,80");
// walls.add("256,96");

// // World Barriers - LEFT
// walls.add("32,48");
// walls.add("32,64");
// walls.add("32,80");
// walls.add("32,96");

// // World Barriers - TOP
// walls.add("48,32");
// walls.add("64,32");
// walls.add("80,32");
// walls.add("96,32");
// walls.add("112,16");
// walls.add("128,16");
// walls.add("144,16");
// walls.add("160,16");
// walls.add("176,16");
// walls.add("192,16");
// walls.add("208,16");
// walls.add("224,16");

// // World Barriers - BOTTOM
// walls.add("48,112");
// walls.add("64,112");
// walls.add("80,112");
// walls.add("96,112");
// walls.add("112,112");
// walls.add("128,112");
// walls.add("144,112");
// walls.add("160,112");
// walls.add("176,112");
// walls.add("192,112");
// walls.add("208,112");
// walls.add("224,112");
// walls.add("240,112");

// // Tree
// ["64,48", "208,64", "224,32"].forEach(c => walls.add(c));

// // Stone
// ["192,96", "208,96", "224,96"].forEach(c => walls.add(c));

// // Squares
// ["64,64", "64,80", "80,64", "80,80", "128,48", "144,48"].forEach(c => walls.add(c));

// // Water
// ["112,80", "128,80", "144,80", "160,80"].forEach(c => walls.add(c));

// // House
// walls.add("224,64");
