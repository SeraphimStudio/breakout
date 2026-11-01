export const waypoints = {
    A: { x: 64, y: 32, connections: ["B"] },
    B: { x: 311, y: 32, connections: ["A", "C"] },
    C: { x: 311, y: 80, connections: ["B", "D", "F"] },
    D: { x: 880, y: 80, connections: ["C"] },
    E: { x: 64, y: 192, connections: ["F"] },
    F: { x: 312, y: 192, connections: ["C", "E", "G"] },
    G: { x: 312, y: 256, connections: ["F", "H"] },
    H: { x: 729, y: 256, connections: ["G", "I"] },
    I: { x: 729, y: 320, connections: ["H", "J", "K"] },
    J: { x: 1328, y: 320, connections: ["I"] },
    K: { x: 729, y: 432, connections: ["I", "L"] },
    L: { x: 1408, y: 432, connections: ["K"] }
}


export const CORRIDORS = [
    { type: "horizontal", y: 32, minX: 64, maxX: 311 },
    { type: "horizontal", y: 80, minX: 311, maxX: 880 },
    { type: "horizontal", y: 192, minX: 64, maxX: 312 },
    { type: "horizontal", y: 256, minX: 312, maxX: 729 },
    { type: "horizontal", y: 320, minX: 729, maxX: 1328 },
    { type: "horizontal", y: 432, minX: 729, maxX: 1408 },
    { type: "vertical", x: 311, minY: 32, maxY: 256 },
    { type: "vertical", x: 729, minY: 256, maxY: 432 }
];