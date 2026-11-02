import Phaser from "phaser";
import LevelBtn from "../components/levelBtn";
import createPlayerAnimations from "../animations/player";
import createEnemyAnims from "../animations/enemies";

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super("mainmenu");
        this.activeModal = null;
    }

    preload() {
        // Tilemaps and tileset
        this.load.tilemapTiledJSON("map", "assets/Tilemaps/map.tmj");
        this.load.tilemapTiledJSON("map2", "assets/Tilemaps/map2.tmj");
        this.load.image("tiles", "assets/Tilemaps/main.png");

        // Character Idle Spritesheets
        this.load.spritesheet("enemy1_idle", "assets/char/1/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_idle", "assets/char/2/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_idle", "assets/char/3/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_idle", "assets/char/6/Idle.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_idle", "assets/char/11/Idle.png", { frameWidth: 48, frameHeight: 48 });

        // Character Walk Spritesheets
        this.load.spritesheet("enemy1_walk", "assets/char/1/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_walk", "assets/char/2/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_walk", "assets/char/3/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_walk", "assets/char/6/Walk.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy4_walk", "assets/char/11/Walk.png", { frameWidth: 48, frameHeight: 48 });

        // Character Special Spritesheets
        this.load.spritesheet("enemy1_special", "assets/char/1/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("player1_special", "assets/char/2/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy2_special", "assets/char/3/Special.png", { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet("enemy3_special", "assets/char/6/Special.png", { frameWidth: 48, frameHeight: 48 });
    }

    create() {
        if (!this.anims.exists("player_idle")) {
            createPlayerAnimations(this.anims);
        }
        if (!this.anims.exists("enemy1_idle")) {
            createEnemyAnims(this.anims);
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f1d);

        const grid = this.add.graphics();
        grid.lineStyle(1, 0x1e293b, 0.4);
        for (let y = 30; y < height; y += 30) {
            grid.lineBetween(0, y, width, y);
        }
        for (let x = 40; x < width; x += 40) {
            grid.lineBetween(x, 0, x, height);
        }

        this.add.rectangle(width / 2, 260, width, 20, 0x0f172a);
        this.add.rectangle(width / 2, 250, width, 2, 0x38bdf8).setAlpha(0.7);

        const playerSprite = this.add.sprite(50, 224, "player1_idle").setScale(1.15);
        playerSprite.play("player_idle");

        const enemySprite = this.add.sprite(430, 224, "enemy2_idle").setScale(1.15).setFlipX(true);
        enemySprite.play("enemy2_idle");

        const title = this.add.text(width / 2, 36, "BREAK OUT", {
            fontSize: "26px",
            fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5);
        title.setShadow(0, 3, "#0369a1", 4, true, true);

        this.add.text(width / 2, 59, "STEALTH ESCAPE MISSION", {
            fontSize: "9px",
            fontFamily: "'Courier New', monospace",
            fontStyle: "bold",
            color: "#94a3b8"
        }).setOrigin(0.5, 0.5);

        this.startBtn = new LevelBtn(this, width / 2, 96, "Start", () => {
            this.scene.start("LevelScene");
        }, {
            width: 150,
            height: 28,
            bgColor: 0x1e3a8a,
            hoverColor: 0x2563eb,
            strokeColor: 0x60a5fa
        });

        this.howToPlayBtn = new LevelBtn(this, width / 2, 132, "How to Play", () => {
            this.openModal("HOW TO PLAY", [
                "• [LEFT / RIGHT] : Run along the corridors",
                "• [UP] : Jump when standing on ground",
                "• [UP / DOWN] : Climb vertical ladders",
                "• Avoid patrolling guards & escape to safety!"
            ]);
        }, {
            width: 150,
            height: 28
        });

        this.achievementsBtn = new LevelBtn(this, width / 2, 168, "Achievements", () => {
            this.openModal("ACHIEVEMENTS", [
                "★ First Escape : Start your very first mission",
                "★ Shadow Step  : Traverse without alert",
                "★ Shaft Master : Climb 5 ladder corridors",
                "★ Mastermind   : Complete all 5 sectors"
            ]);
        }, {
            width: 150,
            height: 28
        });

        this.feedbackBtn = new LevelBtn(this, width / 2, 204, "Feedback", () => {
            this.openModal("FEEDBACK & COMMUNITY", [
                "Enjoying Break Out?",
                "We are constantly tuning patrol paths & levels.",
                "Send your ideas, bug reports, and ratings!",
                "Thank you for playing!"
            ]);
        }, {
            width: 150,
            height: 28
        });

        this.add.text(width / 2, 262, "v1.0.0 • Phaser 3", {
            fontSize: "8px",
            fontFamily: "monospace",
            color: "#64748b"
        }).setOrigin(0.5, 0.5);
    }

    openModal(title, lines) {
        if (this.activeModal) {
            this.activeModal.destroy();
            this.activeModal = null;
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const modal = this.add.container(0, 0).setDepth(100);
        this.activeModal = modal;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
        backdrop.setInteractive();
        modal.add(backdrop);

        const winWidth = 350;
        const winHeight = 180;
        const winX = width / 2;
        const winY = height / 2;

        const winShadow = this.add.graphics();
        winShadow.fillStyle(0x000000, 0.6);
        winShadow.fillRoundedRect(winX - winWidth / 2, winY - winHeight / 2 + 4, winWidth, winHeight, 8);
        modal.add(winShadow);

        const winBg = this.add.graphics();
        winBg.fillStyle(0x0f172a, 1);
        winBg.fillRoundedRect(winX - winWidth / 2, winY - winHeight / 2, winWidth, winHeight, 8);
        winBg.lineStyle(2, 0x38bdf8, 1);
        winBg.strokeRoundedRect(winX - winWidth / 2, winY - winHeight / 2, winWidth, winHeight, 8);
        modal.add(winBg);

        const titleText = this.add.text(winX, winY - winHeight / 2 + 20, title, {
            fontSize: "14px",
            fontFamily: "'Trebuchet MS', Arial, sans-serif",
            fontStyle: "bold",
            color: "#38bdf8"
        }).setOrigin(0.5, 0.5);
        modal.add(titleText);

        const sep = this.add.graphics();
        sep.lineStyle(1, 0x334155, 1);
        sep.lineBetween(winX - winWidth / 2 + 16, winY - winHeight / 2 + 35, winX + winWidth / 2 - 16, winY - winHeight / 2 + 35);
        modal.add(sep);

        const bodyContent = lines.join("\n\n");
        const bodyText = this.add.text(winX, winY - 8, bodyContent, {
            fontSize: "10px",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            color: "#e2e8f0",
            align: "center",
            wordWrap: { width: winWidth - 36 }
        }).setOrigin(0.5, 0.5);
        modal.add(bodyText);

        const closeBtn = new LevelBtn(this, winX, winY + winHeight / 2 - 22, "Close", () => {
            this.tweens.add({
                targets: modal,
                alpha: 0,
                duration: 120,
                onComplete: () => {
                    modal.destroy();
                    this.activeModal = null;
                }
            });
        }, {
            width: 80,
            height: 24,
            fontSize: "11px",
            bgColor: 0x334155,
            hoverColor: 0xd97706,
            strokeColor: 0x64748b,
            hoverStrokeColor: 0xfbbf24
        });
        modal.add(closeBtn);
        modal.setAlpha(0);
        this.tweens.add({
            targets: modal,
            alpha: 1,
            duration: 150,
            ease: "Power2"
        });
    }
}
