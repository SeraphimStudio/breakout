import Phaser from "phaser";
import Enemy from "../systems/enemy";
import CollectSystem from "../systems/collectSystem";
import ObstacleSystem from "../systems/obstacleSystem";
import InputSystem from "../systems/input";
import WinPanel from "../components/winPanel";
import LosePanel from "../components/losePanel";
import soundManager from "../systems/soundManager";
import * as Level1Data from "../data/level1";
import * as Level2Data from "../data/level2";
import * as Level3Data from "../data/level3";
import * as Level4Data from "../data/level4";
import { getLevelById } from "../data/levelProvider";
import createEnemyAnims from "../animations/enemies";

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

        soundManager.init(this.sound);
        soundManager.playMusic("game_ost");

        if (!this.anims.exists("enemy1_idle")) {
            createEnemyAnims(this.anims);
        }

        const levelConfig = getLevelById(this.currentLevel);
        const enemyKey = levelConfig?.enemy || "enemy1";

        let levelData = Level1Data;
        if (this.currentLevel === 2) {
            levelData = Level2Data;
        } else if (this.currentLevel === 3) {
            levelData = Level3Data;
        } else if (this.currentLevel === 4) {
            levelData = Level4Data;
        }
        this.waypoints = levelData.waypoints;
        this.corridors = levelData.CORRIDORS;

        let mapKey = "map";
        if (this.currentLevel === 2 && this.cache.tilemap.has("map2")) {
            mapKey = "map2";
        } else if (this.currentLevel === 3 && this.cache.tilemap.has("map3")) {
            mapKey = "map3";
        } else if (this.currentLevel === 4 && this.cache.tilemap.has("map4")) {
            mapKey = "map4";
        }
        this.map = this.make.tilemap({ key: mapKey });
        const tileset = this.map.addTilesetImage("main", "tiles");

        // Map Layers
        this.bg = this.map.createLayer("bg", tileset, 0, 0);
        this.groundLayer = this.map.createLayer("ground", tileset, 0, 0);
        this.objectLayer = this.map.getLayer("objects") ? this.map.createLayer("objects", tileset, 0, 0) : null;
        this.obstacleLayer = (this.map.getLayer("obstacle") || this.map.getLayer("obstacles"))
            ? this.map.createLayer(this.map.getLayer("obstacle") ? "obstacle" : "obstacles", tileset, 0, 0)
            : null;
        this.collectLayer = this.map.getLayer("collect") ? this.map.createLayer("collect", tileset, 0, 0) : null;
        this.enemypath = this.map.getObjectLayer("enemy_path") || this.map.getObjectLayer("ememy_path");

        if (this.bg) this.bg.setDepth(0);
        if (this.groundLayer) this.groundLayer.setDepth(1);
        if (this.objectLayer) this.objectLayer.setDepth(2);
        if (this.obstacleLayer) this.obstacleLayer.setDepth(3);
        if (this.collectLayer) this.collectLayer.setDepth(4);

        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;

        this.groundLayer.setCollisionFromCollisionGroup();

        // Spawn player
        let spawnPlayerX = 100;
        let spawnPlayerY = 30;
        if (this.currentLevel === 2) {
            spawnPlayerX = 120;
            spawnPlayerY = 80;
        } else if (this.currentLevel === 3) {
            spawnPlayerX = 240;
            spawnPlayerY = 660;
        } else if (this.currentLevel === 4) {
            spawnPlayerX = 280;
            spawnPlayerY = 1090;
        }
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
        const spawnEnemyX = (this.currentLevel >= 2 && this.waypoints?.A) ? this.waypoints.A.x : 64;
        const spawnEnemyY = (this.currentLevel >= 2 && this.waypoints?.A) ? (this.waypoints.A.y - 12) : 20;

        this.time.delayedCall(1000, () => {
            if (this.isLevelFinished || !this.scene.isActive()) return;
            this.enemy = new Enemy(this, spawnEnemyX, spawnEnemyY, enemyKey, this.waypoints, this.corridors);
            this.enemy.body.setDepth(10);
            this.physics.add.collider(this.enemy.body, this.groundLayer);
            this.physics.add.overlap(this.player, this.enemy.body, () => this.handleLose("enemy"), null, this);
        });

        this.collectSystem = new CollectSystem(this, this.collectLayer, this.player, {
            onStarCollect: () => {
                soundManager.playPowerup();
                this.updateHUD();
            },
            onFlagCollect: () => {
                this.handleWin();
            }
        });

        // Obstacle System for hazards (thorns)
        this.obstacleSystem = new ObstacleSystem(this, this.obstacleLayer, this.player, {
            onPlayerHitObstacle: () => {
                this.handleLose("thorns");
            }
        }, this.groundLayer);

        // Camera follow
        const cam = this.cameras.main;
        cam.setZoom(1);
        cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        cam.startFollow(this.player);

        // Input system (WASD, Space, Arrow keys mapped to actions)
        this.inputSystem = new InputSystem(this);

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

    handleLose(reason = "enemy") {
        if (typeof reason !== "string") {
            reason = "enemy";
        }
        if (this.isLevelFinished) return;
        this.isLevelFinished = true;
        soundManager.playGameOver();
        soundManager.stopMusic();
        this.player.setVelocity(0, 0);
        this.player.setTint(0xff4444);
        if (this.player.body) {
            this.player.body.allowGravity = false;
        }
        this.cameras.main.shake(200, 0.01);
        if (this.collectSystem) {
            this.collectSystem.clearRegistry();
        }
        new LosePanel(this, {
            level: this.currentLevel,
            reason,
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
        soundManager.stopMusic();
        soundManager.playVictory();

        this.player.setVelocity(0, 0);
        this.player.setTint(0x34d399);

        const starsCollected = this.registry.get("starsCollected") || (this.collectSystem ? this.collectSystem.getStarsCount() : 0);
        const totalStars = this.registry.get("totalStars") || (this.collectSystem ? this.collectSystem.getTotalStars() : 3);

        if (this.collectSystem) {
            this.collectSystem.clearRegistry();
        }
        this.cameras.main.flash(250, 255, 255, 255);
        new WinPanel(this, {
            level: this.currentLevel,
            starsCollected,
            totalStars,
            onNextLevel: () => {
                const nextLevel = this.currentLevel + 1;
                if (nextLevel <= 4) {
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

    isLadderAt(x, y) {
        const objTile = this.objectLayer ? this.objectLayer.getTileAtWorldXY(x, y) : null;
        if (objTile && objTile.index > 0 && (
            objTile.properties?.isLadder === true ||
            objTile.properties?.isLadder === "true" ||
            [58, 59, 60].includes(objTile.index)
        )) {
            return true;
        }

        const gTile = this.groundLayer ? this.groundLayer.getTileAtWorldXY(x, y) : null;
        if (gTile && gTile.index > 0 && (
            gTile.properties?.isLadder === true ||
            gTile.properties?.isLadder === "true" ||
            [58, 59, 60, 97, 98, 99].includes(gTile.index)
        )) {
            return true;
        }

        return false;
    }

    update(time, delta) {
        if (this.isLevelFinished) return;

        if (this.collectSystem) {
            this.collectSystem.update(time, delta);
        }

        if (this.obstacleSystem) {
            this.obstacleSystem.update(time, delta);
        }

        const px = this.player.body.center.x;
        const py = this.player.body.center.y;
        const pFeet = this.player.body.bottom - 2;
        const pHead = this.player.body.top + 2;

        const onLadder = this.isLadderAt(px, py) ||
            this.isLadderAt(px, pFeet) ||
            this.isLadderAt(px, pHead);

        if (onLadder) {
            this.player.body.allowGravity = false;
            if (this.inputSystem.isDown("move-up")) {
                this.player.setVelocityY(-120);
            } else if (this.inputSystem.isDown("move-down")) {
                this.player.setVelocityY(120);
            } else {
                this.player.setVelocityY(0);
            }
        } else {
            this.player.body.allowGravity = true;
            if (this.inputSystem.isDown("jump") && this.player.body.blocked.down) {
                this.player.setVelocityY(-150);
            }
        }

        if (this.inputSystem.isDown("move-left")) {
            this.player.setVelocityX(-100);
            this.player.play("player_run", true);
            this.player.setFlipX(true);
        } else if (this.inputSystem.isDown("move-right")) {
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
