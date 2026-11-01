/**
 * Level configuration data for Break Out.
 */
export const LEVELS = [
    {
        id: 1,
        title: "Level 1",
        name: "Corridor Escape",
        mapKey: "map",
        description: "Infiltrate the patrol route and learn enemy movement patterns.",
        difficulty: "Normal",
        stars: 3
    },
    {
        id: 2,
        title: "Level 2",
        name: "Underground Vault",
        mapKey: "map2",
        description: "Navigate vertical ladder networks without detection.",
        difficulty: "Hard",
        stars: 3
    },
    {
        id: 3,
        title: "Level 3",
        name: "Rooftop Run",
        mapKey: "map",
        description: "High alert sector with tight patrol coordination.",
        difficulty: "Expert",
        stars: 3
    },
    {
        id: 4,
        title: "Level 4",
        name: "Shadow Fortress",
        mapKey: "map",
        description: "Complex waypoints requiring precise evasion timing.",
        difficulty: "Master",
        stars: 3
    },
    {
        id: 5,
        title: "Level 5",
        name: "Final Breakout",
        mapKey: "map",
        description: "The ultimate trial. Evade all patrol units and escape.",
        difficulty: "Insane",
        stars: 3
    }
];

export function getLevelById(id) {
    return LEVELS.find(lvl => lvl.id === id) || LEVELS[0];
}

