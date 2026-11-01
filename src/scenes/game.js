import Phaser from "phaser";
import Enemy from "../systems/enemy";
import CollectSystem from "../systems/collectSystem";
import WinPanel from "../components/winPanel";
import LosePanel from "../components/losePanel";
import * as Level1Data from "../data/level1";
import * as Level2Data from "../data/level2";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
        this.currentLevel = 1;
        this.isLevelFinished = false;
    }

    init(data) {
        this.currentLevel = data?.level || 1;
        this.isLevelFinished = false;
    }

    create() {
        this.isLevelFinished = false;

        const levelData = this.currentLevel === 2 ? Level2Data : Level1Data;
        this.waypoints = levelData.waypoints;
        this.corridors = levelData.CORRIDORS;

        const mapKey = (this.currentLevel === 2 && this.cache.tilemap.has("map2")) ? "map2" : "map";
        this.map = this.make.tilemap({ key: mapKey });
        const tileset = this.map.addTilesetImage("main", "tiles");

        // Map Layers
        this.bg = this.map.createLayer("bg", tileset, 0, 0);
        this.groundLayer = this.map.createLayer("ground", tileset, 0, 0);
        this.objectLayer = this.map.getLayer("objects") ? this.map.createLayer("objects", tileset, 0, 0) : null;
        this.collectLayer = this.map.getLayer("collect") ? this.map.createLayer("collect", tileset, 0, 0) : null;
        this.enemypath = this.map.getObjectLayer("enemy_path") || this.map.getObjectLayer("ememy_path");

        if (this.bg) this.bg.setDepth(0);
        if (this.groundLayer) this.groundLayer.setDepth(1);
        if (this.objectLayer) this.objectLayer.setDepth(2);
        if (this.collectLayer) this.collectLayer.setDepth(3);

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        this.groundLayer.setCollisionFromCollisionGroup();

        // Spawn player
        const spawnPlayerX = this.currentLevel === 2 ? 120 : 100;
        const spawnPlayerY = this.currentLevel === 2 ? 80 : 30;
        this.player = this.physics.add.sprite(spawnPlayerX, spawnPlayerY, "player1_idle", 0);
        this.player.setCollideWorldBounds(true);
        this.player.play("player_idle", true);
        this.player.setOrigin(0, 0);
        this.player.setDepth(10);
        this.player.setScale(0.75);
        this.player.setBodySize(20, 40);
        this.player.refreshBody();

        this.physics.add.collider(this.player, this.groundLayer);

        // Spawn enemy with a delay of 1 second (1000 ms)
        this.enemy = null;
        const spawnEnemyX = this.currentLevel === 2 ? this.waypoints.A.x : 64;
        const spawnEnemyY = this.currentLevel === 2 ? this.waypoints.A.y - 12 : 20;

        this.time.delayedCall(1000, () => {
            if (this.isLevelFinished || !this.scene.isActive()) return;
            this.enemy = new Enemy(this, spawnEnemyX, spawnEnemyY, "enemy2_idle", this.waypoints, this.corridors);
            this.enemy.body.setDepth(10);
            this.physics.add.collider(this.enemy.body, this.groundLayer);

            // Lose condition: player collides with enemy
            this.physics.add.overlap(this.player, this.enemy.body, this.handleLose, null, this);
        });

        // Collect System for stars and flag
        this.collectSystem = new CollectSystem(this, this.collectLayer, this.player, {
            onStarCollect: () => {
                this.updateHUD();
            },
            onFlagCollect: () => {
                this.handleWin();
            }
        });

        // Camera follow
        const cam = this.cameras.main;
        cam.setZoom(1);
        cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        cam.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        // ESC navigation
        this.input.keyboard.on("keydown-ESC", () => {
            if (this.collectSystem) {
                this.collectSystem.clearRegistry();
            }
            this.scene.start("LevelScene");
        });

        // Fixed HUD display
        const total = this.collectSystem.getTotalStars();
        this.hudText = this.add.text(8, 8, `Level ${this.currentLevel} | ★ 0/${total} | ESC: Levels`, {
            fontSize: "10px",
            fontFamily: "'Trebuchet MS', Arial, sans-serif",
            color: "#ffffff",
            backgroundColor: "#000000aa",
            padding: { x: 5, y: 3 }
        }).setScrollFactor(0).setDepth(100);
    }

    updateHUD() {
        if (!this.hudText) return;
        const stars = this.registry.get("starsCollected") || 0;
        const total = this.registry.get("totalStars") || (this.collectSystem ? this.collectSystem.getTotalStars() : 0);
        this.hudText.setText(`Level ${this.currentLevel} | ★ ${stars}/${total} | ESC: Levels`);
    }

    handleLose() {
        if (this.isLevelFinished) return;
        this.isLevelFinished = true;

        // Freeze player and trigger defeat feedback
        this.player.setVelocity(0, 0);
        this.player.setTint(0xff4444);
        if (this.player.body) {
            this.player.body.allowGravity = false;
        }

        // Camera feedback
        this.cameras.main.shake(200, 0.01);

        // Clear temporary stars in registry on defeat
        if (this.collectSystem) {
            this.collectSystem.clearRegistry();
        }

        // Display Lose Overlay Panel
        new LosePanel(this, {
            level: this.currentLevel,
            onRetry: () => {
                this.scene.restart({ level: this.currentLevel });
            },
            onLevelSelect: () => {
                this.scene.start("LevelScene");
            },
            onMainMenu: () => {
                this.scene.start("mainmenu");
            }
        });
    }

    handleWin() {
        if (this.isLevelFinished) return;
        this.isLevelFinished = true;

        // Freeze player and trigger victory feedback
        this.player.setVelocity(0, 0);
        this.player.setTint(0x34d399);

        // Retrieve stars before clearing the temporary registry state
        const starsCollected = this.registry.get("starsCollected") || (this.collectSystem ? this.collectSystem.getStarsCount() : 0);
        const totalStars = this.registry.get("totalStars") || (this.collectSystem ? this.collectSystem.getTotalStars() : 3);

        // Clear temporary registry stars after win
        if (this.collectSystem) {
            this.collectSystem.clearRegistry();
        }

        // Camera celebration flash
        this.cameras.main.flash(250, 255, 255, 255);

        // Display Win Overlay Panel
        new WinPanel(this, {
            level: this.currentLevel,
            starsCollected,
            totalStars,
            onNextLevel: () => {
                const nextLevel = this.currentLevel + 1;
                if (nextLevel <= 5) {
                    this.scene.restart({ level: nextLevel });
                } else {
                    this.scene.start("LevelScene");
                }
            },
            onReplay: () => {
                this.scene.restart({ level: this.currentLevel });
            },
            onLevelSelect: () => {
                this.scene.start("LevelScene");
            }
        });
    }

    update(time, delta) {
        if (this.isLevelFinished) return;

        // Process collectibles
        if (this.collectSystem) {
            this.collectSystem.update(time, delta);
        }

        const px = this.player.body.center.x;
        const py = this.player.body.center.y;
        const pFeet = this.player.body.bottom - 2;
        const pHead = this.player.body.top + 2;

        const tile = (this.objectLayer && this.objectLayer.getTileAtWorldXY(px, py)) ||
            (this.objectLayer && this.objectLayer.getTileAtWorldXY(px, pFeet)) ||
            (this.objectLayer && this.objectLayer.getTileAtWorldXY(px, pHead)) ||
            (this.groundLayer && this.groundLayer.getTileAtWorldXY(px, py)) ||
            (this.groundLayer && this.groundLayer.getTileAtWorldXY(px, pFeet));

        const onLadder = Boolean(tile && (
            tile.properties?.isLadder === true ||
            tile.properties?.isLadder === "true" ||
            [58, 59, 60].includes(tile.index)
        ));

        if (onLadder) {
            this.player.body.allowGravity = false;
            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-120);
            } else if (this.cursors.down.isDown) {
                this.player.setVelocityY(120);
            } else {
                this.player.setVelocityY(0);
            }
        } else {
            this.player.body.allowGravity = true;
            if (this.cursors.up.isDown && this.player.body.blocked.down) {
                this.player.setVelocityY(-150);
            }
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-100);
            this.player.play("player_run", true);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(100);
            this.player.play("player_run", true);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
            this.player.play("player_idle", true);
        }

        if (this.enemy) {
            this.enemy.move(time, delta);
        }
    }
}
