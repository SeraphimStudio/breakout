import Phaser from "phaser";
export default function createPlayerAnimations(anims) {
    anims.create({
        key: "player_idle",
        frames: anims.generateFrameNumbers("player1_idle", { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });
    anims.create({
        key: "player_run",
        frames: anims.generateFrameNumbers("player1_walk", { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
    });
}
