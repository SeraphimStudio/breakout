export const enemy = "enemy2";

export const waypoints = {
    A: { x: 80, y: 96, connections: ["B"] },
    B: { x: 600, y: 96, connections: ["A", "C"] },
    C: { x: 600, y: 320, connections: ["B", "D", "E"] },
    D: { x: 80, y: 320, connections: ["C"] },
    E: { x: 1224, y: 320, connections: ["C", "F", "G", "I"] },
    F: { x: 2144, y: 320, connections: ["E"] },
    G: { x: 1224, y: 112, connections: ["E", "H"] },
    H: { x: 2288, y: 112, connections: ["G"] },
    I: { x: 1224, y: 544, connections: ["E", "J"] },
    J: { x: 2320, y: 544, connections: ["I"] }
};

export const CORRIDORS = [
    { type: "horizontal", y: 96, minX: 80, maxX: 600 },
    { type: "horizontal", y: 112, minX: 1224, maxX: 2288 },
    { type: "horizontal", y: 320, minX: 80, maxX: 600 },
    { type: "horizontal", y: 320, minX: 600, maxX: 1224 },
    { type: "horizontal", y: 320, minX: 1224, maxX: 2144 },
    { type: "horizontal", y: 320, minX: 80, maxX: 2144 },
    { type: "horizontal", y: 544, minX: 1224, maxX: 2320 },
    { type: "vertical", x: 600, minY: 96, maxY: 320 },
    { type: "vertical", x: 1224, minY: 112, maxY: 544 }
];

