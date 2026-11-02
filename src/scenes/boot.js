import Phaser from "phaser";
import createPlayerAnimations from "../animations/player";
import createEnemyAnims from "../animations/enemies";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a192f);

        this.add.text(width / 2, height / 2 - 40, "Break Out", {
            fontSize: "26px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5).setShadow(2, 2, "#000000", 0);

        this.add.text(width / 2, height / 2 - 14, "by Seraphim Studio", {
            fontSize: "11px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5).setShadow(1, 1, "#000000", 0);

        const barWidth = 200;
        const barHeight = 8;
        const barX = (width - barWidth) / 2;
        const barY = height / 2 + 25;

        const progressBg = this.add.graphics();
        progressBg.fillStyle(0x0f172a, 0.9);
        progressBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
        progressBg.lineStyle(1, 0xd97706, 0.7);
        progressBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 4);

        const progressBar = this.add.graphics();

        this.load.on("progress", (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xf59e0b, 1);
            progressBar.fillRoundedRect(barX + 1, barY + 1, Math.max(0, (barWidth - 2) * value), barHeight - 2, 3);
        });

        this.load.tilemapTiledJSON("map", "assets/Tilemaps/map.tmj");
        this.load.tilemapTiledJSON("map2", "assets/Tilemaps/map2.tmj");
        this.load.tilemapTiledJSON("map3", "assets/Tilemaps/map3.tmj");
        this.load.tilemapTiledJSON("map4", "assets/Tilemaps/map4.tmj");
        this.load.image("tiles", "assets/Tilemaps/main.png");

        this.load.spritesheet("enemy1_idle", "assets/char/1/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_idle", "assets/char/2/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_idle", "assets/char/3/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_idle", "assets/char/6/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_idle", "assets/char/11/Idle.png", { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet("enemy1_walk", "assets/char/1/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_walk", "assets/char/2/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_walk", "assets/char/3/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_walk", "assets/char/6/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_walk", "assets/char/11/Walk.png", { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet("enemy1_special", "assets/char/1/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_special", "assets/char/2/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_special", "assets/char/3/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_special", "assets/char/6/Special.png", { frameWidth: 48, frameHeight: 48 });

        this.load.audio("bg_ost", "audio/BgOst.webm");
        this.load.audio("game_ost", "audio/gameOST.webm");
        this.load.audio("pop", "audio/pop.webm");
        this.load.audio("pop_balloon", "audio/pop_balloon.webm");
        this.load.audio("game_over", "audio/game_over.webm");
        this.load.audio("powerup", "audio/powerup.webm");
        this.load.audio("victory", "audio/victory.webm");
    }

    create() {
        if (!this.anims.exists("player_idle")) {
            createPlayerAnimations(this.anims);
        }
        if (!this.anims.exists("enemy1_idle")) {
            createEnemyAnims(this.anims);
        }

        this.scene.start("mainmenu");
    }
}

