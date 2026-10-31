import Phaser from "phaser";

export default function createEnemyAnims(anims) {
    anims.create({
        key: "enemy1_idle",
        frames: anims.generateFrameNumbers("enemy1_idle", { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1
    });
    anims.create({
        key: "enemy1_run",
        frames: anims.generateFrameNumbers("enemy1_walk", { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy2_idle",
        frames: anims.generateFrameNumbers("enemy2_idle", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });
    anims.create({
        key: "enemy2_run",
        frames: anims.generateFrameNumbers("enemy2_walk", { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy3_idle",
        frames: anims.generateFrameNumbers("enemy3_idle", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });
    anims.create({
        key: "enemy3_run",
        frames: anims.generateFrameNumbers("enemy3_walk", { start: 0, end: 6 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy4_idle",
        frames: anims.generateFrameNumbers("enemy4_idle", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });
    anims.create({
        key: "enemy4_run",
        frames: anims.generateFrameNumbers("enemy4_walk", { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy1_special",
        frames: anims.generateFrameNumbers("enemy1_special", { start: 0, end: 6 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy2_special",
        frames: anims.generateFrameNumbers("enemy2_special", { start: 0, end: 6 }),
        frameRate: 12,
        repeat: -1
    });
    anims.create({
        key: "enemy3_special",
        frames: anims.generateFrameNumbers("enemy3_special", { start: 0, end: 6 }),
        frameRate: 12,
        repeat: -1
    });
}