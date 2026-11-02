export const enemy = "enemy3";

export const waypoints = {
    A: { x: 176, y: 672, connections: ["B"] },
    B: { x: 664, y: 672, connections: ["A", "C", "J"] },
    C: { x: 664, y: 489, connections: ["B", "D"] },
    D: { x: 504, y: 489, connections: ["C", "E", "I"] },
    E: { x: 504, y: 217, connections: ["D", "F", "Q"] },
    F: { x: 840, y: 217, connections: ["E", "G", "P"] },
    G: { x: 840, y: 72, connections: ["F", "H", "R"] },
    H: { x: 1376, y: 72, connections: ["G"] },
    I: { x: 199, y: 489, connections: ["D"] },
    J: { x: 1448, y: 672, connections: ["B", "K"] },
    K: { x: 1448, y: 297, connections: ["J", "L"] },
    L: { x: 1176, y: 297, connections: ["K", "M", "P"] },
    M: { x: 1176, y: 184, connections: ["L", "N", "O"] },
    N: { x: 1241, y: 184, connections: ["M"] },
    O: { x: 1120, y: 184, connections: ["M"] },
    P: { x: 840, y: 297, connections: ["F", "L"] },
    Q: { x: 216, y: 217, connections: ["E"] },
    R: { x: 360, y: 72, connections: ["G"] }
};

export const CORRIDORS = [
    { type: "horizontal", y: 672, minX: 176, maxX: 664 },
    { type: "horizontal", y: 672, minX: 664, maxX: 1448 },
    { type: "horizontal", y: 672, minX: 176, maxX: 1448 },
    { type: "horizontal", y: 489, minX: 199, maxX: 504 },
    { type: "horizontal", y: 489, minX: 504, maxX: 664 },
    { type: "horizontal", y: 489, minX: 199, maxX: 664 },
    { type: "horizontal", y: 297, minX: 840, maxX: 1176 },
    { type: "horizontal", y: 297, minX: 1176, maxX: 1448 },
    { type: "horizontal", y: 297, minX: 840, maxX: 1448 },
    { type: "horizontal", y: 217, minX: 216, maxX: 504 },
    { type: "horizontal", y: 217, minX: 504, maxX: 840 },
    { type: "horizontal", y: 217, minX: 216, maxX: 840 },
    { type: "horizontal", y: 184, minX: 1120, maxX: 1176 },
    { type: "horizontal", y: 184, minX: 1176, maxX: 1241 },
    { type: "horizontal", y: 184, minX: 1120, maxX: 1241 },
    { type: "horizontal", y: 72, minX: 360, maxX: 840 },
    { type: "horizontal", y: 72, minX: 840, maxX: 1376 },
    { type: "horizontal", y: 72, minX: 360, maxX: 1376 },
    { type: "vertical", x: 664, minY: 489, maxY: 672 },
    { type: "vertical", x: 504, minY: 217, maxY: 489 },
    { type: "vertical", x: 840, minY: 72, maxY: 217 },
    { type: "vertical", x: 840, minY: 217, maxY: 297 },
    { type: "vertical", x: 840, minY: 72, maxY: 297 },
    { type: "vertical", x: 1176, minY: 184, maxY: 297 },
    { type: "vertical", x: 1448, minY: 297, maxY: 672 }
];

